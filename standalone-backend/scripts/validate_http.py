import concurrent.futures, json, time, urllib.request, urllib.error, pathlib, os
BASE=os.environ.get('OI_STANDALONE_URL','http://127.0.0.1:8090'); ROOT=pathlib.Path(os.environ.get('OI_PB_DATA_DIR',str(pathlib.Path(__file__).resolve().parents[1]/'pb_data'))).resolve(); clock=ROOT/'test_clock_ms.txt'
from urllib.parse import urlparse
assert urlparse(BASE).hostname in ('127.0.0.1','localhost'), 'Esta suíte somente executa contra loopback de testes.'
passes=[]
def req(path,body=None,token=None,method=None,extra=None):
 h={'Content-Type':'application/json'}
 if token:h['Authorization']='Bearer '+token
 if extra:h.update(extra)
 r=urllib.request.Request(BASE+path,data=None if body is None else json.dumps(body).encode(),headers=h,method=method or ('POST' if body is not None else 'GET'))
 try:
  with urllib.request.urlopen(r,timeout=30) as res:
   raw=res.read();return res.status,json.loads(raw) if 'json' in res.headers.get('Content-Type','') else raw
 except urllib.error.HTTPError as e:
  raw=e.read();return e.code,json.loads(raw)
def check(name,ok,details=None):
 if not ok:raise AssertionError(name+' '+json.dumps(details,ensure_ascii=False))
 passes.append(name);print('PASS:',name,flush=True)
def login(email,password='Skip@Pass'):
 s,j=req('/api/oi/auth/login',{'email':email,'password':password});check('login '+email,s==200,{'status':s,'error':j.get('error')});return j['token'],j['record']['id']
def buy(email,order,status='paid',product='oi-ia-tool',secret=True):
 return req('/api/oi/webhook/kiwify'+('?token=oi-kiwify-test-secret' if secret else ''),{'order_id':order,'order_status':status,'Product':{'product_id':product},'Customer':{'email':email},'is_test':True})
def create(token,id):return req('/api/oi/plans/create',{'category':'rotina','objective':'Organizar a semana e a documentação','difficulty':'iniciante','timeAvailable':'5m','targetDeadline':'7 dias','requestId':id},token)
check('health',req('/api/health')[0]==200)
user='new_'+str(int(time.time()*1000))+'@example.test'
s,j=req('/api/oi/auth/signup',{'email':user,'password':'Synthetic-test-2026','name':'Membro de teste','role':'admin','verified':True})
check('cadastro não concede admin/verificação',s==200,j)
s,j=req('/api/oi/auth/login',{'email':user,'password':'Synthetic-test-2026'});check('não verificado bloqueado',s==403,j)
entry=json.loads((ROOT/'local_inbox/emails.log').read_text().splitlines()[-1]);v=entry['token']
check('token de verificação válido',req('/api/oi/auth/verify-email',{'token':v})[0]==200)
check('token de uso único',req('/api/oi/auth/verify-email',{'token':v})[0]==400)
t,member=login(user,'Synthetic-test-2026');t2,m2=login('user2@organizacaointeligente.com.br')
check('sem compra bloqueado',req('/api/oi/plans/create',{'category':'rotina','objective':'Planejar a semana','requestId':'none'},t)[0]==403)
check('webhook falso rejeitado',buy(user,'unauthorized',secret=False)[0]==401)
check('Kit não libera',buy(user,'kit',product='kit-organizacao-inteligente')[1].get('ignored') is True)
check('sem ciclo após Kit',req('/api/oi/cycle/status',token=t)[1].get('hasCycle') is False)
order='order_'+str(int(time.time()*1000));s,j=buy(user,order);check('aprovação teste aceita',s==200,j)
s,initial=req('/api/oi/cycle/status',token=t);check('aguarda início',initial['status']=='waiting_start',initial)
s,first=req('/api/oi/cycle/start',{},t);check('início',s==200,first)
s,again=req('/api/oi/cycle/start',{},t);check('início repetido não estende',s==200 and first['expiresAt']==again['expiresAt'],again)
s,j=buy(user,order);check('aprovação repetida idempotente',j.get('action')=='already_processed',j)
s,j=buy(user,order+'_another');check('compra durante uso não estende',req('/api/oi/cycle/status',token=t)[1]['expiresAt']==first['expiresAt'],j)
check('coleção planos bloqueada',req('/api/collections/oi_plans/records',token=t)[1].get('totalItems',0)==0)
check('alteração de role bloqueada',req('/api/collections/oi_memberships/records/'+member,{'role':'admin'},t,'PATCH')[0] in (403,404))
s,j=create(t,'first');check('plano criado',s==200,j);plan=j['plan']['id']
check('orçamento 5 min respeitado',sum(x['minutes'] for x in j['plan']['actionsChecklist'])==5)
s,j2=create(t,'first');check('retry sem novo plano/cota',s==200 and j2['plan']['id']==plan and req('/api/oi/cycle/status',token=t)[1]['quotas']['dailyUsed']==1,j2)
with concurrent.futures.ThreadPoolExecutor(max_workers=20) as pool: results=list(pool.map(lambda n:create(t,'parallel_'+str(n)),range(20)))
ok=sum(s==200 for s,j in results);q=req('/api/oi/cycle/status',token=t)[1]['quotas'];check('20 simultâneos respeitam cota',ok==4 and q['dailyUsed']==5 and q['cycleUsed']==5,{'successes':ok,'quota':q,'statuses':[s for s,j in results]})
s,j=req('/api/oi/plans/get?planId='+plan,token=t);check('dono consulta plano',s==200,j)
check('outra conta negada',req('/api/oi/plans/get?planId='+plan,token=t2)[0]==403)
check('outra conta não altera',req('/api/oi/plans/update',{'planId':plan,'title':'Invasão'},t2,'PATCH')[0]==403)
s,pdf=req('/api/oi/plans/export-pdf?planId='+plan,token=t);check('exportação PDF',s==200 and isinstance(pdf,bytes) and pdf.startswith(b'%PDF-'),{'status':s})
(ROOT/'last-test-export.pdf').write_bytes(pdf)
s,j=req('/api/oi/plans/update',{'planId':plan,'title':'Organização da semana'},t,'PATCH');check('edição versionada sem cota',s==200 and j['plan']['version']==2 and req('/api/oi/cycle/status',token=t)[1]['quotas']['dailyUsed']==5,j)
from datetime import datetime
start=datetime.fromisoformat(first['startedAt'].replace('Z','+00:00')).timestamp()*1000
expiry=datetime.fromisoformat(first['expiresAt'].replace('Z','+00:00')).timestamp()*1000
check('21 dias exatos',expiry-start==21*86400000)
# Before each day change, the server reads a private clock file, never a client header.
for day in range(1,10):
 clock.write_text(str(int(start+day*86400000+5000)))
 for n in range(5):
  s,j=create(t,'cycle_'+str(day)+'_'+str(n));check('criação dia '+str(day)+' #'+str(n),s==200,j)
check('cota 50 ciclo',req('/api/oi/cycle/status',token=t)[1]['quotas']['cycleUsed']==50)
clock.write_text(str(int(start+10*86400000)));check('51º uso bloqueado',create(t,'over50')[0]==429)
clock.write_text(str(int(expiry)))
check('edição expirada sem pré-consulta negada',req('/api/oi/plans/update',{'planId':plan,'title':'Expirado'},t,'PATCH')[0]==403)
check('ajuste expirado negado',req('/api/oi/plans/adjust',{'planId':plan,'instructions':'Ajustar','requestId':'expired'},t)[0]==403)
check('download após expiração permitido',req('/api/oi/plans/export-pdf?planId='+plan,token=t)[0]==200)
check('header não altera prazo',req('/api/oi/plans/create',{'category':'rotina','objective':'Planejar','requestId':'spoof'},t,extra={'x-oi-test-time-ms':str(int(start))})[0]==403)
retention=datetime.fromisoformat(first['retentionUntil'].replace('Z','+00:00')).timestamp()*1000
clock.write_text(str(int(retention)));check('retenção encerrada bloqueia download',req('/api/oi/plans/export-pdf?planId='+plan,token=t)[0] in (403,404))
clock.unlink()
# Separate member for auto-start, refunds, and reset/logout, independent from the expired cycle.
s,j=buy('user2@organizacaointeligente.com.br','auto_'+order);check('segundo cliente compra',s==200,j)
initial=req('/api/oi/cycle/status',token=t2)[1]
auto=datetime.fromisoformat(initial['autoStartAt'].replace('Z','+00:00')).timestamp()*1000
clock.write_text(str(int(auto)));s,j=create(t2,'auto_start_create');check('início automático sem consultar status',s==200,j)
clock.unlink()
s,j=buy('user2@organizacaointeligente.com.br','auto_'+order,'refunded');check('reembolso revoga',s==200,j)
check('resultado revogado não é listado',len(req('/api/oi/plans/list',token=t2)[1]['items'])==0)
check('reaprovação não ressuscita',buy('user2@organizacaointeligente.com.br','auto_'+order)[1]['action']=='ignored_out_of_order_resurrection_prevented')
check('refund antes da aprovação',buy(user,'early_'+order,'refunded')[0]==200)
check('tombstone impede aprovação',buy(user,'early_'+order)[1]['action']=='ignored_out_of_order_resurrection_prevented')
check('pedido reset',req('/api/oi/auth/reset-password-request',{'email':user})[0]==200)
r=json.loads((ROOT/'local_inbox/emails.log').read_text().splitlines()[-1])['token']
check('reset real',req('/api/oi/auth/reset-password-confirm',{'token':r,'newPassword':'New-synthetic-2026'})[0]==200)
check('reset token único',req('/api/oi/auth/reset-password-confirm',{'token':r,'newPassword':'Other-synthetic-2026'})[0]==400)
tnew,_=login(user,'New-synthetic-2026');check('senha anterior rejeitada',req('/api/oi/auth/login',{'email':user,'password':'Synthetic-test-2026'})[0]==400)
check('logout',req('/api/oi/auth/logout',{},tnew)[0]==200)
check('sessão invalidada após logout',req('/api/oi/cycle/status',token=tnew)[0]==401)
print(json.dumps({'passed':len(passes),'cases':passes},ensure_ascii=False))
