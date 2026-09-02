-- ════════════════════════════════════════════════════════════════
--  Asignar parent_id a las ~494 subcategorías de Ferretería
--  Ejecutar en el SQL Editor de Supabase DESPUÉS de add_parent_id.sql
-- ════════════════════════════════════════════════════════════════

-- ── 1. Herramientas manuales ─────────────────────────────────────
UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='herramientas-manuales' LIMIT 1
)
WHERE seccion='ferreteria' AND slug IN (
  'p085','p108','p253','p091','p086','p100','p191','p406','p214','p197',
  'p059','p047','p768','p029','p179','p066','p011','p731','p767','p773',
  'p264','p267','p169','p087','p671','p177','p203','p494','p790','p078',
  'p791','p205','p769','p808','p805','p804','p807','p806','p812','p405',
  'p063','p226','p288','p728','p194','p217','p729','p181'
);

-- ── 2. Herramientas de corte ─────────────────────────────────────
UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='herramientas-de-corte' LIMIT 1
)
WHERE seccion='ferreteria' AND slug IN (
  'p049','p128','p216','p004','p193','p127','p617','p798','p439','p131',
  'p782','p843','p045','p046','p215','p043','p200','p735','p464','p734',
  'p092','p093','p080','p863','p025','p201','p676','p192','p733','p775',
  'p774','p173','p683'
);

-- ── 3. Medición y trazo ──────────────────────────────────────────
UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='medicion-y-trazo' LIMIT 1
)
WHERE seccion='ferreteria' AND slug IN (
  'p064','p104','p770','p058','p737','p680','p113','p771','p600','p038',
  'p134','p190','p603','p166','p227','p666'
);

-- ── 4. Máquinas portátiles ───────────────────────────────────────
UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='maquinas-portatiles' LIMIT 1
)
WHERE seccion='ferreteria' AND slug IN (
  'p097','p096','p188','p298','p041','p241','p547','p726','p595','p102',
  'p570','p718','p828','p832','p853','p860','p859','p212','p098','p289',
  'p411','p427','p240','p699','p538','p468','p629','p888','p852','p842',
  'p793','p750','p286','p679','p056','p292','p228','p586','p185','p852'
);

-- ── 5. Jardín y agricultura ──────────────────────────────────────
UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='jardin-y-agricultura' LIMIT 1
)
WHERE seccion='ferreteria' AND slug IN (
  'p299','p402','p401','p408','p409','p407','p404','p070','p077','p114',
  'p174','p187','p455','p155','p186','p218','p825','p826','p827','p007',
  'p112','p095','p817','p776','p294','p712','p146','p481','p784','p789',
  'p075','p693','p732','p431','p403','p739','p738','p802','p752'
);

-- ── 6. Accesorios para máquinas ──────────────────────────────────
UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='accesorios-para-maquinas' LIMIT 1
)
WHERE seccion='ferreteria' AND slug IN (
  'p001','p054','p459','p515','p129','p017','p015','p016','p800','p145',
  'p799','p797','p763','p018','p819','p118','p449','p540','p506','p126',
  'p787','p507','p457','p678','p616','p639','p649','p761','p295','p831',
  'p149','p889','p229','p290','p786','p151'
);

-- ── 7. Electricidad ──────────────────────────────────────────────
UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='electricidad' LIMIT 1
)
WHERE seccion='ferreteria' AND slug IN (
  'p727','p740','p882','p821','p542','p061','p284','p466','p785','p520',
  'p413','p423','p475','p505','p725','p065','p204','p864','p574','p723',
  'p420','p235','p079','p702','p592','p039','p417','p162','p419','p498',
  'p612','p714','p611','p458','p849','p421','p847','p633','p010','p196',
  'p115','p567','p483','p594','p499','p442','p198','p272','p809','p568',
  'p783','p614','p158','p296','p027','p081','p230'
);

-- ── 8. Plomería ──────────────────────────────────────────────────
UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='plomeria' LIMIT 1
)
WHERE seccion='ferreteria' AND slug IN (
  'p467','p685','p781','p697','p851','p681','p621','p604','p597','p668',
  'p613','p518','p703','p822','p476','p814','p815','p813','p818','p628',
  'p638','p530','p854','p531','p543','p532','p053','p297','p537','p839',
  'p560','p573','p160','p551','p713','p486','p523','p650','p233'
);

-- ── 9. Gas y calefacción ─────────────────────────────────────────
UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='gas-y-calefaccion' LIMIT 1
)
WHERE seccion='ferreteria' AND slug IN (
  'p545','p816','p460','p885','p883','p724','p424','p422','p736','p746',
  'p606','p548','p441','p609','p559'
);

-- ── 10. Cerrajería ───────────────────────────────────────────────
UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='cerrajeria' LIMIT 1
)
WHERE seccion='ferreteria' AND slug IN (
  'p164','p031','p030','p032','p167','p168','p024','p013','p572','p794',
  'p589','p635','p033','p148','p211','p206','p695','p778','p207','p824',
  'p846','p287'
);

-- ── 11. Seguridad personal (EPP) ─────────────────────────────────
UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='seguridad-personal' LIMIT 1
)
WHERE seccion='ferreteria' AND slug IN (
  'p224','p071','p222','p562','p221','p223','p722','p446','p555','p687',
  'p487','p488','p213','p448','p220','p716','p593','p747','p711','p293'
);

-- ── 12. Fijaciones y amarre ──────────────────────────────────────
UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='fijaciones-y-amarre' LIMIT 1
)
WHERE seccion='ferreteria' AND slug IN (
  'p549','p865','p513','p858','p829','p519','p040','p558','p605','p866',
  'p867','p124','p777','p002','p020','p484','p440','p552','p625','p602',
  'p575','p036','p745','p576','p238','p554','p835','p021','p231','p234',
  'p720','p646'
);

-- ── 13. Pintura y acabados ───────────────────────────────────────
UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='pintura-y-acabados' LIMIT 1
)
WHERE seccion='ferreteria' AND slug IN (
  'p106','p841','p019','p125','p111','p184','p880','p438','p443','p879',
  'p655','p189','p232'
);

-- ── 14. Almacenaje y transporte ──────────────────────────────────
UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='almacenaje-y-transporte' LIMIT 1
)
WHERE seccion='ferreteria' AND slug IN (
  'p553','p432','p433','p084','p511','p877','p022','p698','p861','p855',
  'p135','p242','p152','p730','p539','p285'
);

-- ── 15. Hogar y baño ─────────────────────────────────────────────
UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='hogar-y-bano' LIMIT 1
)
WHERE seccion='ferreteria' AND slug IN (
  'p721','p514','p694','p521','p517','p795','p640','p844','p569','p546',
  'p845','p874','p801','p838','p637','p648','p641','p875'
);

-- ── 16. Mallas y lonas ───────────────────────────────────────────
UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='mallas-y-lonas' LIMIT 1
)
WHERE seccion='ferreteria' AND slug IN (
  'p244','p871','p873','p872','p618','p686','p082','p758'
);

-- ── 17. Exhibidores (uso interno) ────────────────────────────────
UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='exhibidores' LIMIT 1
)
WHERE seccion='ferreteria' AND slug IN (
  'p581','p474','p583','p060','p585','p580','p582','p579','p578','p577',
  'p154'
);

-- ── 18. Misceláneos ──────────────────────────────────────────────
UPDATE categorias SET parent_id = (
  SELECT id FROM categorias WHERE seccion='ferreteria' AND slug='miscelaneos' LIMIT 1
)
WHERE seccion='ferreteria' AND slug IN (
  'p076','p757','p667','p642','p491','p599','p447','p856','p005','p140',
  'p502','p719','p482','p069','p607','p705','p636','p875'
);

-- ── Verificación ─────────────────────────────────────────────────
SELECT
  p.nombre AS grupo,
  COUNT(h.id) AS subcategorias
FROM categorias p
LEFT JOIN categorias h ON h.parent_id = p.id AND h.seccion = 'ferreteria'
WHERE p.seccion = 'ferreteria' AND p.parent_id IS NULL
GROUP BY p.nombre
ORDER BY p.nombre;
