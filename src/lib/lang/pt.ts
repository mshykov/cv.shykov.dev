import type { LangData } from './types.ts'

// One list for Brazilian and European Portuguese: the headings differ only in
// spelling ("projetos"/"projectos") and in a few preferred terms, and a CV
// uploaded to either page may use either.
export const pt: LangData = {
  code: 'pt',
  scorerSections: {
    experience: ['experiência', 'experiência profissional', 'experiência de trabalho', 'histórico profissional', 'histórico de trabalho', 'percurso profissional', 'atividade profissional', 'actividade profissional', 'trajetória profissional', 'trajectória profissional', 'histórico de empregos', 'vivência profissional'],
    education: ['educação', 'formação', 'formação acadêmica', 'formação académica', 'escolaridade', 'habilitações', 'habilitações literárias', 'percurso académico', 'estudos', 'graduação', 'dados acadêmicos', 'dados académicos'],
    skills: ['habilidades', 'competências', 'competências técnicas', 'habilidades técnicas', 'conhecimentos', 'conhecimentos técnicos', 'aptidões', 'qualificações'],
    summary: ['resumo', 'resumo profissional', 'resumo de qualificações', 'perfil', 'perfil profissional', 'objetivo', 'objetivo profissional', 'objectivo', 'sobre mim', 'apresentação', 'sumário profissional'],
    achievements: ['conquistas', 'realizações', 'principais realizações', 'principais conquistas', 'destaques', 'resultados', 'principais resultados'],
    projects: ['projetos', 'projectos', 'projetos pessoais', 'projetos em destaque', 'projetos acadêmicos'],
    certifications: ['certificações', 'certificados', 'cursos', 'licenças', 'cursos e certificações', 'formação complementar', 'cursos complementares', 'treinamentos', 'capacitações'],
  },
  parserSections: {
    summary: ['resumo', 'resumo profissional', 'perfil', 'perfil profissional', 'objetivo', 'objetivo profissional', 'objectivo', 'sobre mim', 'apresentação'],
    experience: ['experiência', 'experiência profissional', 'experiência de trabalho', 'histórico profissional', 'histórico de trabalho', 'percurso profissional', 'atividade profissional', 'actividade profissional', 'emprego', 'empregos', 'trajetória profissional', 'trajectória profissional', 'histórico de empregos', 'vivência profissional'],
    education: ['educação', 'formação', 'formação acadêmica', 'formação académica', 'escolaridade', 'habilitações', 'habilitações literárias', 'percurso académico', 'estudos', 'graduação', 'dados acadêmicos', 'dados académicos'],
    skills: ['habilidades', 'competências', 'competências técnicas', 'habilidades técnicas', 'conhecimentos', 'conhecimentos técnicos', 'aptidões', 'qualificações', 'tecnologias'],
    projects: ['projetos', 'projectos', 'projetos pessoais', 'projetos em destaque', 'projetos acadêmicos'],
    certifications: ['certificações', 'certificados', 'cursos', 'licenças', 'cursos e certificações', 'formação complementar', 'cursos complementares', 'treinamentos', 'capacitações'],
    languages: ['idiomas', 'línguas', 'línguas estrangeiras', 'idiomas e línguas'],
    interests: ['interesses', 'passatempos', 'hobbies', 'interesses e hobbies', 'interesses pessoais', 'atividades extracurriculares'],
    awards: ['prêmios', 'prémios', 'distinções', 'premiações', 'prêmios e distinções', 'prémios e distinções', 'conquistas', 'realizações', 'honrarias', 'reconhecimentos'],
    other: ['publicações', 'voluntariado', 'trabalho voluntário', 'atividades voluntárias', 'referências', 'contacto', 'contactos', 'contato', 'contatos', 'dados pessoais', 'informações pessoais', 'informações adicionais', 'informações complementares'],
  },
  actionVerbs: [
    'liderei', 'gerenciei', 'geri', 'desenvolvi', 'implementei', 'projetei', 'criei', 'lancei', 'melhorei', 'reduzi', 'aumentei',
    'dirigi', 'coordenei', 'otimizei', 'optimizei', 'automatizei', 'migrei', 'negociei', 'contratei', 'mentorei', 'analisei',
    'construí', 'entreguei', 'escalei', 'estabeleci', 'impulsionei', 'supervisionei', 'alcancei', 'planejei', 'planeei',
    'executei', 'defini', 'fundei', 'conduzi', 'responsabilizei',
    'administrei', 'apresentei', 'atuei', 'ampliei', 'aprimorei', 'arquitetei', 'capacitei', 'consolidei', 'elaborei', 'estruturei',
    'formei', 'gerei', 'identifiquei', 'implantei', 'inovei', 'integrei', 'introduzi', 'mantive', 'modernizei', 'monitorei',
    'organizei', 'orientei', 'padronizei', 'participei', 'promovi', 'reestruturei', 'refatorei', 'reforcei', 'resolvi', 'revisei',
    'simplifiquei', 'treinei', 'validei', 'verifiquei', 'acelerei', 'agilizei', 'colaborei', 'concebi', 'configurei', 'conquistei',
    'corrigi', 'desenhei', 'dimensionei', 'documentei', 'economizei', 'elevei', 'encabecei', 'instalei', 'iniciei', 'redesenhei',
    'publiquei', 'realizei', 'testei', 'transformei', 'ajudei', 'apoiei', 'acompanhei', 'atendi', 'auditei', 'criei', 'cuidei',
    'dei', 'fiz', 'gravei', 'habilitei', 'instituí', 'mapeei', 'medi', 'mobilizei', 'operei', 'ofereci', 'prestei', 'priorizei',
    'produzi', 'programei', 'propus', 'recrutei', 'redigi', 'renovei', 'representei', 'solucionei', 'sustentei', 'tornei', 'vendi',
    'liderar', 'gerir', 'gerenciar', 'desenvolver', 'implementar', 'projetar', 'criar', 'lançar', 'melhorar', 'reduzir',
    'aumentar', 'dirigir', 'coordenar', 'otimizar', 'optimizar', 'automatizar', 'migrar', 'negociar', 'contratar', 'analisar',
    'construir', 'entregar', 'escalar', 'supervisionar', 'alcançar', 'planear', 'planejar', 'executar',
    'administrar', 'apresentar', 'atuar', 'ampliar', 'aprimorar', 'arquitetar', 'capacitar', 'consolidar', 'elaborar', 'estruturar',
    'formar', 'gerar', 'identificar', 'implantar', 'inovar', 'integrar', 'manter', 'modernizar', 'monitorar', 'monitorizar',
    'organizar', 'orientar', 'padronizar', 'participar', 'promover', 'reestruturar', 'refatorar', 'resolver', 'revisar',
    'simplificar', 'treinar', 'validar', 'verificar', 'acelerar', 'colaborar', 'conceber', 'configurar', 'conquistar',
    'corrigir', 'desenhar', 'documentar', 'economizar', 'instalar', 'iniciar', 'redesenhar', 'publicar', 'realizar', 'testar',
    'transformar', 'ajudar', 'apoiar', 'acompanhar', 'atender', 'auditar', 'definir', 'estabelecer', 'fundar', 'conduzir',
    'mentorar', 'recrutar', 'representar', 'vender', 'produzir', 'programar', 'priorizar', 'operar',
    'lidera', 'gere', 'gerencia', 'desenvolve', 'implementa', 'cria', 'lança', 'melhora', 'reduz', 'aumenta', 'coordena',
    'otimiza', 'automatiza', 'analisa', 'constrói', 'entrega', 'supervisiona', 'atua', 'administra', 'elabora', 'gera',
    'implanta', 'integra', 'mantém', 'monitora', 'organiza', 'orienta', 'participa', 'promove', 'realiza', 'resolve', 'treina',
  ],
  impactUnits: [
    'utilizadores', 'usuários', 'pessoas', 'engenheiros', 'clientes', 'horas', 'dias', 'semanas', 'meses', 'milhões', 'milhão', 'mil',
    'colaboradores', 'membros', 'profissionais', 'projetos', 'projectos', 'vendas', 'funcionários', 'alunos', 'reais', 'euros',
    'pedidos', 'sistemas', 'integrantes', 'desenvolvedores', 'programadores', 'analistas', 'países', 'lojas', 'equipes', 'equipas',
  ],
  months: [
    'jan', 'janeiro', 'fev', 'fevereiro', 'mar', 'março', 'abr', 'abril', 'mai', 'maio', 'jun', 'junho', 'jul', 'julho',
    'ago', 'agosto', 'set', 'setembro', 'out', 'outubro', 'nov', 'novembro', 'dez', 'dezembro',
  ],
  ongoing: [
    'presente', 'atual', 'atualmente', 'atualidade', 'actual', 'actualmente', 'actualidade', 'hoje', 'até hoje', 'até o momento',
    'até agora', 'em andamento', 'em curso', 'momento atual', 'cursando',
  ],
  degreeWords: ['licenciatura', 'licenciado', 'bacharelado', 'bacharel', 'mestrado', 'doutoramento', 'doutorado', 'engenharia', 'pós-graduação', 'pos-graduacao', 'mba', 'curso técnico', 'diploma',
    'tecnólogo', 'tecnologo', 'graduação', 'graduacao', 'mestrado integrado', 'especialização', 'especializacao', 'ensino médio',
    'ensino superior', 'ensino secundário', 'técnico em', 'mestre', 'doutor', 'pós-doutorado', 'ctesp', 'curso técnico superior profissional',
    'tecnologia em', 'formação superior'],
  stopwords: (
    'o a os as um uma uns umas e ou mas se então para por de do da dos das em no na nos nas com sem sobre entre desde até como é são ser sido será serão pode podem deve devem tem têm temos nosso nossa nossos nossas seu sua seus suas teu tua este esta estes estas esse essa esses essas isso isto lhe lhes que quem qual quando onde porque também além mais muito muita outros outras outro outra tal incluindo etc vaga cargo atuar atuação conhecimento vivência buscamos estamos você vai irá ter seja sejam sendo estar está estão cada todo toda todos todas mesmo ao aos à às pelo pela pelos pelas num numa já só não sim equipes área time diferencial função equipa equipe trabalho trabalhar trabalhando experiência anos capacidade forte excelente bom boa ótimo ajudar construir usando uso usado dentro procuramos procurando juntar responsabilidades requisitos qualificações empresa candidato candidatos ideal desejável semana dia dias mês meses ano benefícios salário candidatar posição oportunidade ambiente cultura pessoas novo nova bem fazer feito'
  ).split(/\s+/),
  detectWords: ['o', 'a', 'os', 'as', 'de', 'do', 'da', 'em', 'com', 'para', 'por', 'uma', 'que', 'e', 'no', 'na', 'experiência', 'ao', 'não', 'um', 'dos', 'das', 'pelo'],
}
