// Renderer Process - UI Logic and Event Handling
class MindmapRenderer {
    constructor() {
        this.panelVisible = true;
        this.scale = 1.0;
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0, scrollLeft: 0, scrollTop: 0 };
        this.isSpacePressed = false;

        // Project management
        this.projects = [
                {
                    id: 'test-ia-simple',
                    name: 'IA Responsable (Prueba Info)',
                    content: `IA Responsable | Práctica de diseñar, desarrollar e implementar sistemas de inteligencia artificial de manera ética, considerando su impacto en sociedad, economía y medio ambiente.
1. Frameworks y Metodologías | Enfoques estructurados para implementar IA responsable en organizaciones, incluyendo marcos éticos y herramientas de evaluación.
* Marcos Éticos | Fundamentos filosóficos y principios morales que guían el desarrollo ético de IA a nivel global.
   * IEEE Ethically Aligned Design | Marco comprehensivo para sistemas de IA éticos que priorizan bienestar humano con estándares de ingeniería detallados.
   * Principios de Asilomar | 23 principios desarrollados por comunidad de investigación en IA para asegurar desarrollo beneficioso y seguro de sistemas inteligentes.
   * Declaración de Montreal | Principios centrados en humanos para desarrollo de IA que beneficie a todos mediante enfoque inclusivo.
* Marcos de Gobernanza | Estructuras organizacionales y procesos para supervisión efectiva de IA a nivel institucional y corporativo.
   * NIST AI Risk Management Framework | Marco estadounidense para identificar, evaluar y gestionar riesgos relacionados con IA de forma sistemática y completa.
   * Principios OECD de IA | Directrices internacionales para IA confiable adoptadas por países miembros promoviendo innovación responsable global.
   * Recomendaciones UNESCO sobre Ética | Estándares éticos globales para IA adoptados por 193 estados miembros asegurando respeto por derechos humanos.
* Herramientas de Evaluación | Métodos y técnicas para evaluar sistemas de IA contra criterios éticos y de desempeño establecidos.
   * Evaluaciones de Impacto | Análisis sistemático de efectos potenciales del despliegue de IA en individuos, sociedad y ambiente con métricas cuantificables.
   * Matrices de Riesgo | Herramientas estructuradas para evaluar y priorizar riesgos relacionados con IA basados en probabilidad de ocurrencia e impacto.
   * Comités de Revisión Ética | Grupos independientes multidisciplinarios que revisan proyectos de IA para conformidad ética y cumplimiento normativo riguroso.
2. Riesgos y Desafíos | Impactos negativos potenciales que requieren gestión proactiva y mitigación sistemática en sistemas de IA.
* Riesgos Técnicos | Desafíos que surgen del diseño, desarrollo y operación de sistemas de IA relacionados con limitaciones tecnológicas.
   * Sesgo Algorítmico | Injusticia sistemática en predicciones o decisiones de IA que perpetúa o amplifica discriminación existente en datos entrenamiento.
   * Deriva del Modelo | Degradación del rendimiento cuando condiciones del mundo real cambian respecto a datos de entrenamiento originales del sistema.
   * Ataques Adversariales | Entradas maliciosas diseñadas específicamente para engañar a sistemas de IA y causar clasificaciones erróneas o fallas críticas.
   * Problema de Caja Negra | Incapacidad para entender o explicar proceso de toma de decisiones en modelos complejos de IA profunda.
* Riesgos Sociales | Impactos más amplios en sociedad derivados del despliegue masivo de IA afectando estructuras sociales y económicas.
   * Desplazamiento Laboral | Automatización que reemplaza trabajadores humanos en múltiples industrias potencialmente causando desempleo masivo y crisis económica.
   * Brecha Digital | Acceso desigual a beneficios de IA entre diferentes poblaciones exacerbando desigualdades existentes en educación y oportunidades.
   * Difusión de Desinformación | Contenido falso o engañoso generado o amplificado por IA manipulando opinión pública y procesos democráticos.
* Riesgos Éticos | Desafíos morales fundamentales en desarrollo y uso de IA que cuestionan valores humanos básicos y normas sociales.
   * Armas Autónomas | Sistemas de IA capaces de seleccionar y atacar objetivos sin intervención humana planteando dilemas éticos profundos.
   * Manipulación y Persuasión | IA utilizada para influir indebidamente en comportamiento humano socavando autonomía individual y libre albedrío.
   * Amenazas a Dignidad Humana | Aplicaciones de IA que deshumanizan, objetifican o reducen personas a puntos de datos sin considerar complejidad humana.`
                },
                {
                    id: 'default',
                    name: 'ENTRADA DE ESQUEMA',
                    content: `Nuevo Mapa Mental
1. Idea Principal
* Subtema 1
* Subtema 2
2. Segunda Idea
* Desarrollo
* Conclusiones`
                },
                {
                    id: 'ia-responsable',
                    name: 'Inteligencia Artificial Responsable',
                    content: `IA Responsable | La práctica integral de diseñar, desarrollar e implementar sistemas de inteligencia artificial de manera ética y responsable, considerando su impacto en la sociedad, economía y medio ambiente. Implica establecer principios, procesos y mecanismos de gobernanza que aseguren que la IA beneficie a la humanidad mientras se minimizan los riesgos potenciales y se respetan los derechos humanos fundamentales.
1. Principios Fundamentales | Directrices esenciales que garantizan que los sistemas de IA beneficien a la humanidad mientras minimizan los riesgos potenciales. Estos principios sirven como base ética y operativa para todo el ciclo de vida de los sistemas de IA, desde su concepción hasta su implementación y monitoreo continuo.
* Equidad y No Discriminación | Garantizar que los sistemas de IA traten a todos los individuos y grupos de manera equitativa sin sesgos injustos.
   * Prevención de sesgos | Técnicas y metodologías sistemáticas para identificar, medir y eliminar prejuicios injustos en algoritmos de IA.
   * Resultados equitativos | Asegurar que los beneficios y oportunidades generados por la IA se distribuyan de manera justa entre todos los grupos demográficos.
   * Diseño inclusivo | Crear sistemas de IA accesibles y beneficiosos para poblaciones diversas, incluyendo personas con discapacidades.
* Transparencia | Hacer que los sistemas de IA sean comprensibles y sus procesos de toma de decisiones sean claros para usuarios y stakeholders.
   * IA Explicable (XAI) | Métodos y técnicas que hacen las decisiones de la IA interpretables y comprensibles para humanos.
   * Interpretabilidad de modelos | Comprender cómo los modelos de IA llegan a conclusiones específicas, incluyendo la importancia relativa de diferentes características.
   * Documentación de decisiones | Registro completo y auditable de los procesos de decisión de la IA para responsabilidad y revisión posterior.
* Responsabilidad | Marcos claros de responsabilidad para el desarrollo, implementación y operación de sistemas de IA.
   * Propiedad clara | Definir inequívocamente quién es responsable de los resultados y consecuencias de los sistemas de IA.
   * Pistas de auditoría | Registros integrales y a prueba de manipulaciones de todas las decisiones y procesos de los sistemas de IA.
   * Asignación de responsabilidades | Roles y responsabilidades explícitos para la gobernanza y supervisión de la IA en toda la organización.
* Privacidad y Seguridad | Proteger la información personal y garantizar la integridad de los sistemas de IA contra amenazas internas y externas.
   * Protección de datos | Salvaguardar la información personal utilizada en sistemas de IA mediante técnicas de encriptación, anonimización y control de acceso.
   * Gestión de consentimiento | Asegurar la autorización adecuada y transparente para el uso de datos en sistemas de IA, respetando la autonomía del usuario.
   * Medidas de ciberseguridad | Proteger los sistemas de IA contra ataques maliciosos, manipulación y uso no autorizado mediante defensas multicapa.
* Diseño Centrado en el Humano | Priorizar las necesidades humanas y mantener el control humano significativo sobre las decisiones de la IA.
   * Supervisión humana | Mantener control humano significativo y apropiado sobre las decisiones de la IA, especialmente en contextos de alto riesgo.
   * Empoderamiento del usuario | Habilitar a los usuarios para comprender, controlar y beneficiarse de sus interacciones con sistemas de IA.
   * Aumento no reemplazo | La IA debe mejorar y amplificar las capacidades humanas en lugar de sustituir completamente a los trabajadores.
2. Riesgos y Desafíos de la IA | Impactos negativos potenciales que requieren gestión proactiva y mitigación sistemática.
* Riesgos Técnicos | Desafíos que surgen del diseño, desarrollo y operación de sistemas de IA, relacionados con limitaciones inherentes de la tecnología actual.
   * Sesgo algorítmico | Injusticia sistemática en las predicciones o decisiones de la IA que puede perpetuar o amplificar discriminación existente.
   * Deriva del modelo | Degradación del rendimiento del modelo cuando las condiciones del mundo real cambian respecto a los datos de entrenamiento originales.
   * Ataques adversariales | Entradas maliciosas diseñadas específicamente para engañar a los sistemas de IA y causar clasificaciones erróneas.
   * Problema de caja negra | Incapacidad para entender o explicar el proceso de toma de decisiones en modelos complejos de IA.
* Riesgos Sociales | Impactos más amplios en la sociedad derivados del despliegue masivo de IA que pueden afectar estructuras sociales, económicas y culturales.
   * Desplazamiento laboral | Automatización que reemplaza trabajadores humanos en múltiples industrias, potencialmente causando desempleo masivo.
   * Brecha digital | Acceso desigual a los beneficios de la IA entre diferentes poblaciones, exacerbando desigualdades existentes.
   * Difusión de desinformación | Contenido falso o engañoso generado o amplificado por IA que puede manipular opinión pública.
   * Preocupaciones de vigilancia | Violaciones de privacidad mediante monitoreo potenciado por IA que puede erosionar libertades civiles.
* Riesgos Éticos | Desafíos morales fundamentales en el desarrollo y uso de IA que cuestionan valores humanos básicos y normas sociales.
   * Armas autónomas | Sistemas de IA capaces de seleccionar y atacar objetivos sin intervención humana.
   * Manipulación y persuasión | IA utilizada para influir indebidamente en el comportamiento humano, socavando la autonomía.
   * Violaciones del consentimiento | Uso de datos personales sin autorización adecuada, violando la privacidad y autonomía individual.
   * Amenazas a la dignidad humana | Aplicaciones de IA que deshumanizan, objetifican o reducen a las personas a puntos de datos.
* Riesgos Legales y de Cumplimiento | Desafíos regulatorios y legales en un panorama normativo en rápida evolución.
   * Incertidumbres de responsabilidad | Falta de claridad sobre quién es legalmente responsable cuando la IA causa daños o toma decisiones erróneas.
   * Problemas de propiedad intelectual | Preguntas sobre la propiedad del contenido generado por IA y el uso de material protegido en entrenamiento.
   * Incumplimiento regulatorio | Falta de adherencia a las regulaciones de IA en evolución, resultando en sanciones y daño reputacional.
3. Panorama Regulatorio | Leyes, regulaciones y estándares que gobiernan el desarrollo y uso de IA a nivel global, regional y nacional.
* Regulaciones Globales | Marcos y acuerdos internacionales que buscan armonizar enfoques de gobernanza de IA entre países.
   * Ley de IA de la UE | Regulación integral basada en riesgos para IA en Europa, estableciendo requisitos diferenciados según el nivel de riesgo.
   * Implicaciones del GDPR | Requisitos de protección de datos que afectan significativamente a los sistemas de IA.
   * Regulaciones de IA de China | Enfoque chino hacia la gobernanza de IA enfocado en seguridad nacional y estabilidad social.
   * Iniciativas federales de EE.UU. | Esfuerzos de política y regulación de IA estadounidenses, balanceando innovación con protección de derechos.
* Estándares de la Industria | Estándares técnicos y mejores prácticas desarrollados por organizaciones de normalización.
   * ISO/IEC 23053 y 23894 | Estándares internacionales para confiabilidad en IA que establecen marco para sistemas robustos y éticos.
   * Estándares IEEE | Estándares de ingeniería profesional para IA ética desarrollados por la comunidad técnica global.
   * Guías específicas del sector | Marcos de gobernanza de IA adaptados a necesidades y riesgos únicos de industrias específicas.
* Marcos Nacionales | Estrategias y regulaciones de IA específicas de cada país que reflejan prioridades y valores nacionales.
   * Directiva de Canadá | Directrices del gobierno canadiense para el uso de IA en servicios públicos, enfatizando transparencia.
   * Marco de IA del Reino Unido | Enfoque británico pro-innovación para la regulación de IA, favoreciendo principios sobre reglas prescriptivas.
   * Modelo de Singapur | Marco de gobernanza de Singapur para ética en IA, balanceando innovación con gestión de riesgos.
4. Marcos y Metodologías | Enfoques estructurados y sistemáticos para implementar IA responsable en organizaciones.
* Marcos Éticos | Fundamentos filosóficos y principios morales que guían el desarrollo ético de IA.
   * IEEE Diseño Éticamente Alineado | Estándares de ingeniería comprehensivos para sistemas de IA éticos que priorizan el bienestar humano.
   * Principios de IA de Asilomar | 23 principios desarrollados por la comunidad de investigación de IA para el desarrollo beneficioso de IA.
   * Declaración de Montreal | Principios centrados en el humano para el desarrollo de IA que beneficie a todos.
* Marcos de Gobernanza | Estructuras organizacionales y procesos para supervisión efectiva de IA a nivel institucional.
   * Gestión de Riesgos de IA del NIST | Marco estadounidense integral para identificar, evaluar y gestionar riesgos relacionados con IA.
   * Principios de IA de la OCDE | Directrices internacionales para IA confiable adoptadas por países miembros y socios.
   * Ética de IA de UNESCO | Estándares éticos globales para IA adoptados por 193 estados miembros.
* Herramientas de Evaluación | Métodos y técnicas para evaluar sistemas de IA contra criterios éticos y de desempeño.
   * Evaluaciones de impacto | Análisis sistemático de efectos potenciales del despliegue de IA en individuos, sociedad y ambiente.
   * Matrices de riesgo | Herramientas estructuradas para evaluar y priorizar riesgos relacionados con IA basados en probabilidad e impacto.
   * Comités de revisión ética | Grupos independientes multidisciplinarios que revisan proyectos de IA para conformidad ética.
5. Oportunidades y Beneficios | Impactos positivos transformadores de la adopción responsable de IA en economía, sociedad y organizaciones.
* Crecimiento Económico | Contribución de la IA al desarrollo económico, productividad, e innovación a escala macro y micro.
   * Aceleración de innovación | IA catalizando ciclos de investigación y desarrollo más rápidos en todas las industrias.
   * Ganancias de productividad | Mejora dramática de eficiencia operacional mediante automatización inteligente y optimización de procesos.
   * Creación de nuevos mercados | Surgimiento de productos, servicios, y modelos de negocio completamente nuevos habilitados por IA.
* Bien Social | Aplicaciones de IA que abordan desafíos sociales críticos y mejoran calidad de vida para todos.
   * Avance en salud | IA revolucionando diagnóstico médico, desarrollo de tratamientos, y prestación de atención sanitaria.
   * Accesibilidad educativa | Aprendizaje personalizado y adaptativo que hace educación de calidad accesible para todos.
   * Monitoreo ambiental | IA rastreando y abordando cambio climático, pérdida de biodiversidad, y degradación ambiental.
* Ventajas Empresariales | Beneficios competitivos tangibles de adoptar prácticas de IA responsable que crean valor empresarial sostenible.
   * Diferenciación competitiva | Destacar en el mercado mediante prácticas éticas de IA que resuenan con consumidores conscientes.
   * Construcción de confianza | Ganar y mantener confianza de clientes, empleados, inversores y sociedad mediante transparencia.
   * Mitigación de riesgos | Evitar daños reputacionales, legales, y financieros mediante gestión proactiva de riesgos de IA.`
                },
                {
                    id: 'ia-responsable-pwc',
                    name: 'IA Responsable - PwC',
                    content: `IA Responsable
1. Desconfianza en la IA
* Contexto global | Estudios de PwC muestran desconfianza generalizada en implementaciones de IA y falta de transparencia en su uso
   * Medición de valor de IA responsable | Investigación sobre cómo medir el valor que genera implementar IA de forma responsable
   * Encuesta de IA responsable | Análisis de percepciones y preocupaciones de empresas y consumidores sobre IA
2. Riesgos de Implementaciones IA
* Propiedad intelectual | Uso no autorizado de contenido protegido en entrenamiento de modelos, infracción de derechos de autor y patentes
* Protección de datos | Procesamiento inadecuado de datos personales, violaciones de privacidad y incumplimiento de regulaciones como GDPR
* Preocupaciones de seguridad | Vulnerabilidad a ataques adversariales, manipulación de modelos y exposición de información sensible
* Dependencia excesiva en datos generados | Sobreconfianza en salidas de IA sin validación humana, propagación de errores y decisiones incorrectas
* Explicabilidad | Falta de transparencia en decisiones de modelos tipo caja negra, dificultad para justificar resultados ante stakeholders
* Sesgo e imparcialidad | Discriminación algorítmica basada en datos de entrenamiento sesgados, perpetuación de inequidades existentes
3. Principios Fundamentales
* Equidad y no discriminación | Asegurar que sistemas IA traten a todos los individuos y grupos de manera justa sin sesgos
   * Prevención de sesgos | Técnicas para detectar y mitigar sesgos en datos y algoritmos
   * Resultados equitativos | Garantizar impacto justo entre diferentes grupos demográficos
   * Diseño inclusivo | Considerar diversidad desde fase de diseño del sistema
* Transparencia | Claridad sobre funcionamiento y decisiones de sistemas IA para generar confianza
   * Explicabilidad (XAI) | Métodos para interpretar decisiones de modelos complejos
   * Interpretabilidad de modelos | Balance entre precisión y capacidad de explicación
   * Documentación de decisiones | Registro completo del proceso de toma de decisiones
* Responsabilidad | Definición clara de roles y rendición de cuentas en sistemas IA
   * Propiedad clara | Asignación de responsables para cada componente del sistema
   * Trazabilidad de auditoría | Mantener registros detallados de todas las operaciones
   * Asignación de responsabilidad | Matriz RACI para proyectos de IA
* Privacidad y Seguridad | Protección de datos personales y sistemas contra amenazas
   * Protección de datos | Implementar principios de privacy-by-design
   * Gestión de consentimiento | Sistemas robustos para obtener y gestionar consentimiento
   * Medidas de ciberseguridad | Protección contra ataques adversariales
* Diseño centrado en el humano | Mantener control humano y aumentar capacidades sin reemplazar
   * Supervisión humana | Mantener humanos en el loop para decisiones críticas
   * Empoderamiento del usuario | Dar control y agencia a usuarios finales
   * Aumento no reemplazo | Enfoque en complementar capacidades humanas
4. Estándares y Guías Regulatorias
* EU AI Act | Marco jurídico integral para regulación de IA en Unión Europea
   * Enfoque basado en riesgo | Clasificación de sistemas IA según impactos potenciales en salud, seguridad y derechos fundamentales
   * Normas armonizadas | Establecimiento de reglas uniformes para uso de sistemas IA incluyendo IA generativa
   * Medidas concretas | Requerimientos específicos para evitar impactos negativos identificados
   * IA de propósito general | Regulación específica para modelos fundacionales y GPT
* NIST AI RMF | Marco voluntario del Instituto Nacional de Estándares y Tecnología de EE. UU.
   * Gestión de riesgos IA | Directrices para identificar, evaluar y mitigar riesgos asociados con IA
   * Consideraciones de equidad | Guías para asegurar fairness en sistemas IA
   * Privacidad | Protección de datos personales en todo el ciclo de vida
   * Responsabilidad y solidez | Accountability y robustez técnica de sistemas
   * Seguridad | Protección contra amenazas y vulnerabilidades
* COSO ERM para IA | Aplicación de marco COSO de control interno a iniciativas de IA
   * Alineación con estrategia | Vincular riesgos de IA con objetivos estratégicos organizacionales
   * Ejecución de proyectos | Gestión de riesgos durante implementación de proyectos IA
   * Marco conocido | Aprovechamiento de framework COSO ampliamente adoptado
* ISO 42001:2023 | Primera norma internacional certificable para sistemas de gestión de IA
   * Requisitos formales | Estándar con requerimientos específicos para certificación
   * Sistema de gestión IA | Establecer, implementar, mantener y mejorar SGAI
   * Enfoque basado en riesgos | Identificación y gestión proactiva de riesgos
   * Responsabilidades éticas | Consideraciones éticas integradas en gestión
   * Transparencia y rendición | Accountability en desarrollo y uso de IA
* ISO 23894:2023 | Guía para gestión de riesgos en sistemas IA
   * Riesgos únicos de IA | Identificación de riesgos específicos como sesgos y transparencia
   * Ciclo de vida completo | Gestión de riesgos a lo largo de todo el ciclo de vida del sistema
   * Alineación con ISO 31000 | Integración con prácticas establecidas de gestión de riesgos
   * Evaluación continua | Monitoreo y evaluación ongoing de riesgos emergentes
* ISO 42005:2025 | Guía para evaluaciones de impacto de sistemas IA
   * Evaluaciones de impacto | Orientación para realizar impact assessments de sistemas IA
   * Impactos en individuos | Análisis de efectos en personas, grupos y sociedad
   * Aplicaciones previsibles | Evaluación de usos esperados e inesperados del sistema
   * Transparencia y confianza | Documentación de impactos para generar confianza
   * Ciclo de vida IA | Consideración de impactos en todas las fases del sistema
5. Servicios PwC IA Responsable
* Upskilling en control interno | Capacitación de equipos en controles sobre sistemas de IA
   * Programas de formación | Cursos estructurados sobre gestión de riesgos de IA
   * Casos de uso prácticos | Ejercicios basados en implementaciones reales
   * Certificaciones | Preparación para estándares como ISO 42001
* Evaluación de línea base | Assessment inicial de controles sobre IA existentes
   * Gap análisis frameworks | Comparación contra NIST AI RMF y otros frameworks de IA responsable
   * Gap análisis regulaciones | Evaluación de cumplimiento con EU AI Act y regulaciones locales
   * Benchmarking | Comparación con mejores prácticas de industria
* Revisión de control interno | Auditoría de controles sobre implementaciones IA
   * Revisión contra COSO ERM | Evaluación de controles de IA usando framework COSO para IA
   * Identificación de gaps | Detección de deficiencias en diseño y operación de controles
   * Recomendaciones | Plan de acción para fortalecer control interno
* Revisión de modelo IA responsable | Auditoría de implementación específica de IA
   * ISAE 3000 approach | Aseguramiento usando estándar internacional de auditoría
   * Criterio NIST | Evaluación contra framework NIST AI RMF
   * Normas locales | Cumplimiento con regulaciones específicas del país
   * Testing de modelos | Pruebas técnicas de sesgo, equidad y robustez
* Revisión de madurez de gobierno | Evaluación de estructura de governance de IA
   * Modelo de madurez | Assessment de nivel de madurez en gestión de IA
   * Estructura organizacional | Evaluación de roles, responsabilidades y comités
   * Políticas y procedimientos | Revisión de documentación de gobierno de IA
6. Ventajas PwC
* Conocimiento de procesos | Comprensión profunda de procesos y datos usados en implementaciones IA
   * Experiencia en cliente | Conocimiento acabado del contexto organizacional
   * Entendimiento de datos | Familiaridad con fuentes de datos y calidad
* Sinergias con auditorías | Aprovechamiento de trabajos complementarios
   * Auditoría financiera | Integración con auditoría de estados financieros
   * Memoria integrada | Conexión con revisión de reportes de sostenibilidad
   * Procedimientos de doble propósito | Eficiencia mediante uso múltiple de evidencia
* Independencia | Objetividad e imparcialidad en evaluaciones
   * Tercero independiente | Perspectiva externa sin conflictos de interés
   * Estándares profesionales | Cumplimiento de normas de independencia
* Equipo multidisciplinario | Diversidad de experticia para evaluación integral
   * Mindset de auditor | Enfoque sistemático y escéptico profesional
   * Especialistas técnicos | Expertos en ciencia de datos y ML
   * Conocimiento regulatorio | Experiencia en compliance y riesgos
7. Definición IA Responsable
* Conjunto de prácticas | Framework estructurado de metodologías y procedimientos para gestión responsable de IA
* Generación de confianza | Objetivo primario de construir trust entre stakeholders en sistemas IA
* Balance riesgos-beneficios | Equilibrio consciente entre capitalizar oportunidades y mitigar riesgos de IA
* Adopción de tecnologías | Facilitación de implementación segura y ética de soluciones de inteligencia artificial`
                },
                {
                    id: 'sostenibilidad-esg-pwc',
                    name: 'Sostenibilidad ESG - PwC',
                    content: `Confianza en Información de Sostenibilidad
1. Por qué es importante ESG
* Reguladores | Los bancos centrales y reguladores se centran en riesgo climático, greenwashing y financiamiento sostenible. La regulación global sobre ESG se está acelerando
* Inversionistas | Quieren acceso a conjunto completo de información financiera y no financiera de grado de inversión con coherencia y alta calidad
* Grupos de interés | Esperan que organizaciones equilibren creación de valor con obligaciones sociales más amplias. Exigen mejor desempeño ESG y más transparencia
   * Directorios y comités de auditoría | Deben proporcionar supervisión de la gestión y el desempeño de los riesgos ESG
* Cambio en panorama | El panorama de presentación de informes está cambiando con movimientos hacia solución global de estándares
2. Riesgos de falta de confianza
* Greenwashing | Declaraciones engañosas sobre prácticas ambientales que erosionan confianza del mercado
* Fraude ambiental | Manipulación intencional de datos ambientales con consecuencias legales y reputacionales
* Problemas de compliance | Incumplimiento de regulaciones ESG con sanciones y multas potenciales
* Impacto reputacional | Pérdida de credibilidad ante stakeholders que afecta valor de marca y relaciones
* Inconsistencias de información | Discrepancias entre información financiera y ESG que generan desconfianza en mercados
3. Brechas más relevantes
* Sistemas | Infraestructura tecnológica inadecuada para gestión de datos ESG
   * Planillas electrónicas | Uso de hojas de cálculo como sistema primario sin controles robustos
   * Sistemas departamentales | Soluciones aisladas sin integración que generan silos de información
   * Sistemas no críticos | Clasificación incorrecta de sistemas ESG que no reciben inversión adecuada
* Procesos | Procedimientos y controles insuficientes para asegurar calidad de datos
   * Riesgos no identificados | Falta de evaluación sistemática de riesgos en reporte ESG
   * Controles con problemas | Deficiencias en diseño y operación de controles sobre información ESG
   * Falta de madurez | Controles en etapas iniciales sin pruebas de efectividad
* Personas | Capacidad humana insuficiente para gestión ESG
   * Formación | Falta de entrenamiento específico en estándares y metodologías ESG
   * Capacitación | Programas de desarrollo continuo insuficientes para el equipo
   * Ecosistema de cursos | Carencia de recursos educativos estructurados sobre sostenibilidad
* Gobernanza | Estructura de supervisión y rendición de cuentas débil
   * Supervisión del directorio | Involucramiento limitado del directorio en temas ESG estratégicos
   * Tres líneas de defensa | Modelo de gestión de riesgos no implementado para ESG
* Auditoría | Aseguramiento insuficiente de información ESG
   * Información no auditada | Datos ESG publicados sin verificación independiente
   * Nivel de rigurosidad bajo | Revisiones limitadas que no alcanzan estándar de auditoría razonable
* Framework Regulador | Marco normativo en evolución y fragmentado
   * Múltiples estándares | Proliferación de frameworks sin convergencia clara
   * Regulaciones en curso | Proceso de emisión de normas sobre confiabilidad aún en desarrollo
4. Ecosistema de Estándares ESG
* International Sustainability Standards Board (ISSB) | Marco global emergente para estándares de sostenibilidad que busca convergencia internacional
* EU Sustainable Finance Disclosure Regulation | Regulación europea sobre divulgación de información de finanzas sostenibles
* Umbrella reporting standards | Marcos que cubren amplitud de temas ESG proporcionando estructura integral
   * GRI (Global Reporting Initiative) | Estándar ampliamente adoptado para reporte de sostenibilidad
   * SASB (Sustainability Accounting Standards Board) | Estándares específicos por industria
* Single issue standards | Protocolos de medición y frameworks para temas específicos
   * Carbon footprint protocols | Metodologías para cálculo de huella de carbono
   * Water stewardship standards | Marcos para gestión responsable del agua
* Sustainability Ratings & Rankings | Evaluaciones de terceros que miden desempeño ESG de organizaciones
5. Servicios PwC Sostenibilidad
* Estrategia y oferta de valor | Propuesta diferenciada para clientes de auditoría financiera
   * Equipo multidisciplinario | Auditores tradicionales, de sistemas y procesos con conocimientos específicos de sostenibilidad
   * Sinergias con auditoría financiera | Aprovechamiento de conocimiento del cliente y procedimientos de doble propósito
   * Identificación de observaciones | Hallazgos en procesos y sistemas que sirven para mejora continua
   * Conversaciones estratégicas | Diálogo con personal adecuado en empresas: áreas de aseguramiento y CFO
* Servicios específicos | Portafolio de soluciones para necesidades de sostenibilidad
   * Revisión de memoria de sostenibilidad | Aseguramiento de reportes anuales ESG
   * Huella de Carbono | Medición, verificación y estrategia de reducción de emisiones
   * Trabajos de interoffice | Proyectos referidos desde PwC Global
   * Auditorías con opinión razonable | Transición hacia aseguramiento de mayor nivel
6. Equipo y Oportunidades
* Estructura del Equipo | Configuración y capacidades del equipo de sostenibilidad
   * Alojado en Assurance | Integrado con práctica de auditoría para maximizar sinergias
   * Skills específicos reducidos | Equipo core con experiencia especializada en sostenibilidad
   * Personal TI y procesos | Utilización de recursos en baja temporada con conocimientos complementarios
* Oportunidades de Crecimiento | Áreas de expansión y desarrollo
   * Crecimiento en cartera actual | Profundización de servicios en clientes existentes
   * Servicios complementarios | Expansión hacia huella de carbono y otros temas ESG
   * Trabajos globales | Aprovechamiento de red PwC para proyectos internacionales
   * Opinión razonable | Evolución hacia auditorías de mayor aseguramiento
* Desafíos | Retos para desarrollo sostenible de la práctica
   * Upskilling del equipo | Necesidad de capacitación continua en estándares emergentes
   * Transición a CoE | Evolución hacia Centro de Excelencia que presta servicios transversales
   * Demanda creciente | Gestión de volumen de trabajo con recursos limitados`
                }
            ];
        this.currentProject = null;

        // Panel visibility
        this.panelVisible = true;
        this.projectsPanelVisible = true;
        this.headerVisible = true;

        // Categories management
        this.categories = [];
        this.categoriesPanelVisible = false;
        this.activeCategories = new Set(); // Active filter categories
        this.editingCategoryId = null;

        this.init();
        this.setupEventListeners();
        this.setupElectronIntegration();
        this.setupCategoriesPanel();
        this.loadProjects();
        this.loadCategories();
    }

    init() {
        // Initialize with sample data
        this.generateMindmap();

        // Reset view
        setTimeout(() => {
            this.resetView();
        }, 100);
    }

    setupEventListeners() {
        // View mode toggle
        document.getElementById('editModeBtn').addEventListener('click', () => {
            this.switchViewMode('edit');
        });

        document.getElementById('presentModeBtn').addEventListener('click', () => {
            this.switchViewMode('presentation');
        });

        // File upload
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileUpload(e.target);
        });

        // Button events
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateMindmap();
        });

        document.getElementById('addProjectBtn').addEventListener('click', () => {
            this.addNewProject();
        });

        document.getElementById('expandAllBtn').addEventListener('click', () => {
            window.mindmapEngine.expandAll();
        });

        document.getElementById('collapseAllBtn').addEventListener('click', () => {
            window.mindmapEngine.collapseAll();
        });

        document.getElementById('resetViewBtn').addEventListener('click', () => {
            this.resetView();
        });

        document.getElementById('centerViewBtn').addEventListener('click', () => {
            this.centerView();
        });

        document.getElementById('zoomInBtn').addEventListener('click', () => {
            this.zoomIn();
        });

        document.getElementById('zoomOutBtn').addEventListener('click', () => {
            this.zoomOut();
        });

        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('togglePanelBtn').addEventListener('click', () => {
            this.togglePanel();
        });

        document.getElementById('toggleHeaderBtn').addEventListener('click', () => {
            this.toggleHeader();
        });

        // Modal events
        document.getElementById('modalOverlay').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('closeModalBtn').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('saveNodeBtn').addEventListener('click', () => {
            window.mindmapEngine.saveNodeData();
        });

        document.getElementById('closeShortcutsBtn').addEventListener('click', () => {
            this.closeShortcuts();
        });

        // Image upload
        document.getElementById('imageUpload').addEventListener('change', (e) => {
            this.handleImageUpload(e.target);
        });

        // Context menu events
        document.getElementById('contextEdit').addEventListener('click', () => {
            if (window.contextNodeId && window.contextNodeTitle) {
                window.mindmapEngine.editNode(window.contextNodeId, window.contextNodeTitle);
            }
            this.hideContextMenu();
        });

        document.getElementById('contextToggleInfo').addEventListener('click', () => {
            if (window.contextNodeId) {
                window.mindmapEngine.toggleInfo(window.contextNodeId);
            }
            this.hideContextMenu();
        });

        document.getElementById('contextToggleChildren').addEventListener('click', () => {
            if (window.contextNodeId) {
                window.mindmapEngine.toggleNode(window.contextNodeId);
            }
            this.hideContextMenu();
        });

        document.getElementById('contextAddChild').addEventListener('click', () => {
            if (window.contextNodeId) {
                window.mindmapEngine.addChildNode(window.contextNodeId);
            }
            this.hideContextMenu();
        });

        document.getElementById('contextDelete').addEventListener('click', () => {
            if (window.contextNodeId) {
                if (confirm('¿Estás seguro de que quieres eliminar este nodo?')) {
                    window.mindmapEngine.deleteNode(window.contextNodeId);
                }
            }
            this.hideContextMenu();
        });

        // Keyboard events
        this.setupKeyboardShortcuts();

        // Drag and zoom functionality
        this.setupMindmapInteraction();

        // Prevent context menu on mindmap
        document.getElementById('mindmapContainer').addEventListener('contextmenu', (e) => {
            if (e.target.id === 'mindmapContainer' || e.target.classList.contains('mindmap-wrapper')) {
                e.preventDefault();
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Track space key for pan mode
            if (e.code === 'Space' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                this.isSpacePressed = true;
                document.getElementById('mindmapContainer').style.cursor = 'grab';
            }

            // Global shortcuts
            if (e.metaKey || e.ctrlKey) {
                switch (e.code) {
                    case 'KeyN':
                        e.preventDefault();
                        this.newMindmap();
                        break;
                    case 'KeyS':
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.saveFileAs();
                        } else {
                            this.saveFile();
                        }
                        break;
                    case 'KeyO':
                        e.preventDefault();
                        this.openFile();
                        break;
                    case 'KeyF':
                        e.preventDefault();
                        this.showFind();
                        break;
                    case 'Equal': // Cmd/Ctrl + =
                    case 'NumpadAdd':
                        e.preventDefault();
                        this.zoomIn();
                        break;
                    case 'Minus':
                    case 'NumpadSubtract':
                        e.preventDefault();
                        this.zoomOut();
                        break;
                    case 'Digit0':
                    case 'Numpad0':
                        e.preventDefault();
                        this.resetZoom();
                        break;
                    case 'Backslash':
                        e.preventDefault();
                        this.togglePanel();
                        break;
                    case 'KeyI':
                        e.preventDefault();
                        if (window.mindmapEngine.selectedNode) {
                            window.mindmapEngine.toggleInfo(window.mindmapEngine.selectedNode);
                        }
                        break;
                    case 'Enter':
                        e.preventDefault();
                        if (window.mindmapEngine.selectedNode) {
                            window.mindmapEngine.editNode(window.mindmapEngine.selectedNode, 'Selected Node');
                        }
                        break;
                }

                // Expand/Collapse with Shift
                if (e.shiftKey) {
                    switch (e.code) {
                        case 'KeyE':
                            e.preventDefault();
                            window.mindmapEngine.expandAll();
                            break;
                        case 'KeyC':
                            e.preventDefault();
                            window.mindmapEngine.collapseAll();
                            break;
                        case 'KeyH':
                            e.preventDefault();
                            this.toggleHeader();
                            break;
                    }
                }
            }

            // Node manipulation (without Cmd/Ctrl)
            if (!e.metaKey && !e.ctrlKey) {
                switch (e.code) {
                    case 'Tab':
                        e.preventDefault();
                        if (window.mindmapEngine.selectedNode) {
                            window.mindmapEngine.addChildNode(window.mindmapEngine.selectedNode);
                        }
                        break;
                    case 'Enter':
                        e.preventDefault();
                        // Add sibling node (would need parent reference)
                        break;
                    case 'Delete':
                    case 'Backspace':
                        e.preventDefault();
                        if (window.mindmapEngine.selectedNode) {
                            if (confirm('¿Estás seguro de que quieres eliminar este nodo?')) {
                                window.mindmapEngine.deleteNode(window.mindmapEngine.selectedNode);
                            }
                        }
                        break;
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                this.isSpacePressed = false;
                document.getElementById('mindmapContainer').style.cursor = 'grab';
            }
        });
    }

    setupMindmapInteraction() {
        const container = document.getElementById('mindmapContainer');
        const wrapper = document.getElementById('mindmapWrapper');

        // Zoom with mouse wheel - Reduced sensitivity
        container.addEventListener('wheel', (e) => {
            if (e.metaKey || e.ctrlKey) {
                e.preventDefault();
                // Reduced sensitivity: smaller delta change
                const delta = e.deltaY > 0 ? 0.98 : 1.02;
                this.scale *= delta;
                this.scale = Math.min(Math.max(this.scale, 0.3), 3);

                const rect = container.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                wrapper.style.transformOrigin = `${x}px ${y}px`;
                wrapper.style.transform = `scale(${this.scale})`;

                // Update canvas scale
                window.mindmapEngine.isDirty = true;
            }
        });

        // Mouse drag to pan
        container.addEventListener('mousedown', (e) => {
            if (this.isSpacePressed || e.target === container ||
                e.target.classList.contains('mindmap-wrapper') ||
                e.target.classList.contains('mindmap-nodes')) {
                this.isDragging = true;
                container.style.cursor = 'grabbing';
                this.dragStart.x = e.pageX;
                this.dragStart.y = e.pageY;
                this.dragStart.scrollLeft = container.scrollLeft;
                this.dragStart.scrollTop = container.scrollTop;
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                e.preventDefault();
                const x = e.pageX - this.dragStart.x;
                const y = e.pageY - this.dragStart.y;
                container.scrollLeft = this.dragStart.scrollLeft - x * 1.5;
                container.scrollTop = this.dragStart.scrollTop - y * 1.5;
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                container.style.cursor = this.isSpacePressed ? 'grab' : 'grab';
            }
        });
    }

    setupElectronIntegration() {
        if (window.electronAPI) {
            window.electronAPI.onMenuAction((action, data) => {
                switch (action) {
                    case 'menu-new':
                        this.newMindmap();
                        break;
                    case 'menu-save':
                        this.saveFile();
                        break;
                    case 'menu-export-image':
                        this.exportImage();
                        break;
                    case 'menu-export-json':
                        this.exportData();
                        break;
                    case 'menu-find':
                        this.showFind();
                        break;
                    case 'menu-zoom-in':
                        this.zoomIn();
                        break;
                    case 'menu-zoom-out':
                        this.zoomOut();
                        break;
                    case 'menu-zoom-reset':
                        this.resetZoom();
                        break;
                    case 'menu-expand-all':
                        window.mindmapEngine.expandAll();
                        break;
                    case 'menu-collapse-all':
                        window.mindmapEngine.collapseAll();
                        break;
                    case 'menu-toggle-sidebar':
                        this.togglePanel();
                        break;
                    case 'menu-add-child':
                        if (window.mindmapEngine.selectedNode) {
                            window.mindmapEngine.addChildNode(window.mindmapEngine.selectedNode);
                        }
                        break;
                    case 'menu-edit-node':
                        if (window.mindmapEngine.selectedNode) {
                            const node = window.mindmapEngine.findNode(window.mindmapEngine.selectedNode, window.mindmapEngine.nodes);
                            if (node) {
                                window.mindmapEngine.editNode(window.mindmapEngine.selectedNode, node.title);
                            }
                        }
                        break;
                    case 'menu-delete-node':
                        if (window.mindmapEngine.selectedNode) {
                            if (confirm('¿Estás seguro de que quieres eliminar este nodo?')) {
                                window.mindmapEngine.deleteNode(window.mindmapEngine.selectedNode);
                            }
                        }
                        break;
                    case 'menu-toggle-info':
                        if (window.mindmapEngine.selectedNode) {
                            window.mindmapEngine.toggleInfo(window.mindmapEngine.selectedNode);
                        }
                        break;
                    case 'show-preferences':
                        this.showPreferences();
                        break;
                    case 'show-shortcuts':
                        this.showShortcuts();
                        break;
                    case 'file-opened':
                        this.loadFileContent(data);
                        break;
                    case 'save-file-as':
                        this.saveFileAs(data);
                        break;
                }
            });
        }
    }

    // Categories Panel Setup and Management
    setupCategoriesPanel() {
        // Toggle categories panel button
        const toggleBtn = document.getElementById('toggleCategoriesBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleCategoriesPanel());
        }

        // Close categories panel button
        const closeBtn = document.getElementById('closeCategoriesPanel');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.toggleCategoriesPanel());
        }

        // Add category button
        const addBtn = document.getElementById('addCategoryBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openCategoryModal());
        }

        // Collapse categories panel button
        const collapseBtn = document.getElementById('collapseCategoriesPanel');
        if (collapseBtn) {
            collapseBtn.addEventListener('click', () => this.toggleCategoriesPanelCollapse());
        }

        // Close category modal
        const closeModalBtn = document.getElementById('closeCategoryModalBtn');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.closeCategoryModal());
        }

        // Modal overlay
        const modalOverlay = document.getElementById('categoryModalOverlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', () => this.closeCategoryModal());
        }

        // Save category button
        const saveBtn = document.getElementById('saveCategoryBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveCategory());
        }

        // Color picker
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                colorOptions.forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
    }

    toggleCategoriesPanel() {
        const panel = document.getElementById('categoriesPanel');
        if (panel) {
            this.categoriesPanelVisible = !this.categoriesPanelVisible;
            if (this.categoriesPanelVisible) {
                panel.classList.remove('hidden');
            } else {
                panel.classList.add('hidden');
            }
        }
    }

    toggleCategoriesPanelCollapse() {
        const panel = document.getElementById('categoriesPanel');
        if (panel) {
            panel.classList.toggle('collapsed');
        }
    }

    loadCategories() {
        const saved = localStorage.getItem('mindmap-categories');
        if (saved) {
            try {
                this.categories = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading categories:', e);
                this.categories = [];
            }
        }
        this.renderCategoriesPanel();
    }

    saveCategories() {
        localStorage.setItem('mindmap-categories', JSON.stringify(this.categories));
    }

    renderCategoriesPanel() {
        const list = document.getElementById('categoriesList');
        if (!list) return;

        list.innerHTML = '';

        this.categories.forEach(category => {
            const item = document.createElement('div');
            item.className = 'category-item';
            item.dataset.id = category.id;

            if (this.activeCategories.has(category.id)) {
                item.classList.add('active');
            }

            // Calculate count of nodes with this category
            const nodeCount = this.getNodeCountForCategory(category.id);

            item.innerHTML = `
                <div class="category-color" style="background: ${category.color};"></div>
                <div class="category-info">
                    <div class="category-name">${category.icon ? category.icon + ' ' : ''}${category.name}</div>
                    <div class="category-count">${nodeCount} nodos</div>
                </div>
                <div class="category-actions">
                    <button class="category-action-btn edit-category-btn" title="Editar">✎</button>
                    <button class="category-action-btn delete-category-btn" title="Eliminar">🗑</button>
                </div>
            `;

            // Toggle category filter
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('category-action-btn')) {
                    this.toggleCategoryFilter(category.id);
                }
            });

            // Edit button
            const editBtn = item.querySelector('.edit-category-btn');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openCategoryModal(category.id);
            });

            // Delete button
            const deleteBtn = item.querySelector('.delete-category-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`¿Eliminar la categoría "${category.name}"?`)) {
                    this.deleteCategory(category.id);
                }
            });

            list.appendChild(item);
        });

        this.updateCategoryStats();
    }

    getNodeCountForCategory(categoryId) {
        if (!window.mindmapEngine || !window.mindmapEngine.nodeData) return 0;

        let count = 0;
        Object.values(window.mindmapEngine.nodeData).forEach(data => {
            if (data.categories && data.categories.includes(categoryId)) {
                count++;
            }
        });
        return count;
    }

    updateCategoryStats() {
        const totalNodes = window.mindmapEngine ?
            Object.keys(window.mindmapEngine.nodeData || {}).length : 0;

        let categorizedNodes = 0;
        if (window.mindmapEngine && window.mindmapEngine.nodeData) {
            Object.values(window.mindmapEngine.nodeData).forEach(data => {
                if (data.categories && data.categories.length > 0) {
                    categorizedNodes++;
                }
            });
        }

        const totalEl = document.getElementById('totalNodesCount');
        const categorizedEl = document.getElementById('categorizedNodesCount');

        if (totalEl) totalEl.textContent = totalNodes;
        if (categorizedEl) categorizedEl.textContent = categorizedNodes;
    }

    openCategoryModal(categoryId = null) {
        this.editingCategoryId = categoryId;

        const modal = document.getElementById('categoryEditModal');
        const overlay = document.getElementById('categoryModalOverlay');
        const title = document.getElementById('categoryModalTitle');
        const nameInput = document.getElementById('categoryNameInput');
        const iconInput = document.getElementById('categoryIconInput');
        const colorOptions = document.querySelectorAll('.color-option');

        if (categoryId) {
            // Edit mode
            const category = this.categories.find(c => c.id === categoryId);
            if (category) {
                title.textContent = 'Editar Categoría';
                nameInput.value = category.name;
                iconInput.value = category.icon || '';

                // Select color
                colorOptions.forEach(option => {
                    option.classList.remove('selected');
                    if (option.dataset.color === category.color) {
                        option.classList.add('selected');
                    }
                });
            }
        } else {
            // Create mode
            title.textContent = 'Nueva Categoría';
            nameInput.value = '';
            iconInput.value = '';

            // Select first color by default
            colorOptions.forEach((option, index) => {
                option.classList.remove('selected');
                if (index === 0) option.classList.add('selected');
            });
        }

        modal.classList.add('active');
        overlay.classList.add('active');
        nameInput.focus();
    }

    closeCategoryModal() {
        const modal = document.getElementById('categoryEditModal');
        const overlay = document.getElementById('categoryModalOverlay');

        modal.classList.remove('active');
        overlay.classList.remove('active');
        this.editingCategoryId = null;
    }

    saveCategory() {
        const nameInput = document.getElementById('categoryNameInput');
        const iconInput = document.getElementById('categoryIconInput');
        const selectedColor = document.querySelector('.color-option.selected');

        const name = nameInput.value.trim();
        if (!name) {
            alert('Por favor ingresa un nombre para la categoría');
            return;
        }

        const color = selectedColor ? selectedColor.dataset.color : '#6b7280';
        const icon = iconInput.value.trim();

        if (this.editingCategoryId) {
            // Update existing category
            const category = this.categories.find(c => c.id === this.editingCategoryId);
            if (category) {
                category.name = name;
                category.color = color;
                category.icon = icon;
            }
        } else {
            // Create new category
            const newCategory = {
                id: 'cat-' + Date.now(),
                name,
                color,
                icon
            };
            this.categories.push(newCategory);
        }

        this.saveCategories();
        this.renderCategoriesPanel();
        this.closeCategoryModal();

        // Reapply filters (will update styles if filter is active)
        this.applyFilters();
    }

    deleteCategory(categoryId) {
        // Remove category from array
        this.categories = this.categories.filter(c => c.id !== categoryId);

        // Remove category from active filters
        this.activeCategories.delete(categoryId);

        // Remove category from all nodes
        if (window.mindmapEngine && window.mindmapEngine.nodeData) {
            Object.values(window.mindmapEngine.nodeData).forEach(data => {
                if (data.categories) {
                    data.categories = data.categories.filter(id => id !== categoryId);
                }
            });
        }

        this.saveCategories();
        this.renderCategoriesPanel();
        this.applyFilters(); // This will update styles if filter is active
    }

    toggleCategoryFilter(categoryId) {
        if (this.activeCategories.has(categoryId)) {
            this.activeCategories.delete(categoryId);
        } else {
            this.activeCategories.add(categoryId);
        }

        this.renderCategoriesPanel();
        this.applyFilters();
    }

    applyFilters() {
        if (this.activeCategories.size === 0) {
            // No filters active - remove all styles and show all nodes
            document.querySelectorAll('.node-content').forEach(node => {
                node.classList.remove('category-filtered');
                // Remove visual highlighting
                node.classList.remove('has-category');
                node.style.removeProperty('--category-bg');
                node.style.removeProperty('--category-border');
                node.style.removeProperty('--category-shadow');
                node.style.removeProperty('--category-glow');
                // Remove badge
                const badge = node.querySelector('.category-badge');
                if (badge) badge.remove();
            });
            return;
        }

        // Apply filters and visual styles
        document.querySelectorAll('.node-content').forEach(node => {
            const nodeId = node.id;
            const nodeData = window.mindmapEngine.nodeData[nodeId];

            if (!nodeData || !nodeData.categories || nodeData.categories.length === 0) {
                // Node has no categories - hide it
                node.classList.add('category-filtered');
                // Remove visual highlighting
                node.classList.remove('has-category');
                node.style.removeProperty('--category-bg');
                node.style.removeProperty('--category-border');
                node.style.removeProperty('--category-shadow');
                node.style.removeProperty('--category-glow');
            } else {
                // Check if node has any active category
                const hasActiveCategory = nodeData.categories.some(catId =>
                    this.activeCategories.has(catId)
                );

                if (hasActiveCategory) {
                    node.classList.remove('category-filtered');
                    // Apply visual style when filter is active
                    this.updateNodeStyle(nodeId);
                } else {
                    node.classList.add('category-filtered');
                    // Remove visual highlighting for non-matching nodes
                    node.classList.remove('has-category');
                    node.style.removeProperty('--category-bg');
                    node.style.removeProperty('--category-border');
                    node.style.removeProperty('--category-shadow');
                    node.style.removeProperty('--category-glow');
                }
            }
        });
    }

    assignCategoryToNode(nodeId, categoryId) {
        if (!window.mindmapEngine.nodeData[nodeId]) {
            window.mindmapEngine.nodeData[nodeId] = {
                notes: '',
                images: [],
                showInfo: false,
                categories: []
            };
        }

        if (!window.mindmapEngine.nodeData[nodeId].categories) {
            window.mindmapEngine.nodeData[nodeId].categories = [];
        }

        const categories = window.mindmapEngine.nodeData[nodeId].categories;
        const index = categories.indexOf(categoryId);

        if (index > -1) {
            // Remove category
            categories.splice(index, 1);
        } else {
            // Add category
            categories.push(categoryId);
        }

        // Don't apply visual style immediately - only when filter is active
        this.renderCategoriesPanel();
        this.applyFilters(); // This will apply styles if filter is active
    }

    updateNodeStyle(nodeId) {
        const node = document.getElementById(nodeId);
        if (!node) return;

        const nodeData = window.mindmapEngine.nodeData[nodeId];

        if (!nodeData || !nodeData.categories || nodeData.categories.length === 0) {
            // Remove category styling
            node.classList.remove('has-category');
            node.style.removeProperty('--category-bg');
            node.style.removeProperty('--category-border');
            node.style.removeProperty('--category-shadow');
            node.style.removeProperty('--category-glow');
            return;
        }

        // Find which of the node's categories are currently active in filters
        const activeMatchingCategories = nodeData.categories
            .filter(catId => this.activeCategories.has(catId))
            .map(catId => this.categories.find(c => c.id === catId))
            .filter(cat => cat !== undefined);

        // If no active categories match, use first category as fallback
        const categoriesToShow = activeMatchingCategories.length > 0
            ? activeMatchingCategories
            : [this.categories.find(c => c.id === nodeData.categories[0])].filter(c => c);

        if (categoriesToShow.length === 0) return;

        node.classList.add('has-category');

        if (categoriesToShow.length === 1) {
            // Single category - use solid color
            const category = categoriesToShow[0];
            const r = parseInt(category.color.slice(1, 3), 16);
            const g = parseInt(category.color.slice(3, 5), 16);
            const b = parseInt(category.color.slice(5, 7), 16);

            node.style.setProperty('--category-bg', `rgba(${r}, ${g}, ${b}, 0.08)`);
            node.style.setProperty('--category-border', `rgba(${r}, ${g}, ${b}, 0.6)`);
            node.style.setProperty('--category-shadow', `rgba(${r}, ${g}, ${b}, 0.2)`);
            node.style.setProperty('--category-glow', `rgba(${r}, ${g}, ${b}, 0.05)`);
        } else {
            // Multiple categories - create gradients
            const colors = categoriesToShow.map(cat => {
                const r = parseInt(cat.color.slice(1, 3), 16);
                const g = parseInt(cat.color.slice(3, 5), 16);
                const b = parseInt(cat.color.slice(5, 7), 16);
                return { r, g, b, hex: cat.color };
            });

            // Create linear gradient for background
            const bgGradient = colors.map((c, i) =>
                `rgba(${c.r}, ${c.g}, ${c.b}, 0.08) ${i * (100 / (colors.length - 1))}%`
            ).join(', ');

            // Create linear gradient for border
            const borderGradient = colors.map((c, i) =>
                `rgba(${c.r}, ${c.g}, ${c.b}, 0.6) ${i * (100 / (colors.length - 1))}%`
            ).join(', ');

            // Use average color for shadow/glow
            const avgR = Math.round(colors.reduce((sum, c) => sum + c.r, 0) / colors.length);
            const avgG = Math.round(colors.reduce((sum, c) => sum + c.g, 0) / colors.length);
            const avgB = Math.round(colors.reduce((sum, c) => sum + c.b, 0) / colors.length);

            node.style.setProperty('--category-bg', `linear-gradient(135deg, ${bgGradient})`);
            node.style.setProperty('--category-border', `linear-gradient(135deg, ${borderGradient})`);
            node.style.setProperty('--category-shadow', `rgba(${avgR}, ${avgG}, ${avgB}, 0.2)`);
            node.style.setProperty('--category-glow', `rgba(${avgR}, ${avgG}, ${avgB}, 0.05)`);
        }

        // Add category badge if node has multiple categories assigned
        if (nodeData.categories.length > 1) {
            let badge = node.querySelector('.category-badge');
            if (!badge) {
                badge = document.createElement('div');
                badge.className = 'category-badge';
                node.appendChild(badge);
            }
            // Show count of active matching categories if filtering, otherwise total count
            const count = activeMatchingCategories.length > 0
                ? activeMatchingCategories.length
                : nodeData.categories.length;
            badge.textContent = count > 1 ? `${count}` : `+${nodeData.categories.length - 1}`;
        } else {
            const badge = node.querySelector('.category-badge');
            if (badge) badge.remove();
        }
    }

    updateAllNodeStyles() {
        if (!window.mindmapEngine || !window.mindmapEngine.nodeData) return;

        Object.keys(window.mindmapEngine.nodeData).forEach(nodeId => {
            this.updateNodeStyle(nodeId);
        });
    }

    generateMindmap() {
        const input = document.getElementById('outlineInput').value;
        if (!input.trim()) {
            alert('Por favor ingresa un esquema');
            return;
        }

        // Don't clear nodeData - let parser initialize it
        const root = window.mindmapEngine.parseOutline(input);
        window.mindmapEngine.renderNodes(root);
    }

    handleFileUpload(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            document.getElementById('outlineInput').value = content;
            this.generateMindmap();
        };
        reader.readAsText(file);
        input.value = ''; // Reset input
    }

    handleImageUpload(input) {
        if (input.files && window.currentEditingNode) {
            Array.from(input.files).forEach(file => {
                if (!file.type.startsWith('image/')) {
                    alert('Solo se permiten archivos de imagen');
                    return;
                }

                if (file.size > 5 * 1024 * 1024) {
                    alert('El tamaño de la imagen debe ser menor a 5MB');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    if (!window.mindmapEngine.nodeData[window.currentEditingNode]) {
                        window.mindmapEngine.nodeData[window.currentEditingNode] = { notes: '', images: [], showInfo: false };
                    }
                    if (!window.mindmapEngine.nodeData[window.currentEditingNode].images) {
                        window.mindmapEngine.nodeData[window.currentEditingNode].images = [];
                    }

                    if (e.target.result && e.target.result.startsWith('data:image')) {
                        window.mindmapEngine.nodeData[window.currentEditingNode].images.push(e.target.result);
                        const node = window.mindmapEngine.findNode(window.currentEditingNode, window.mindmapEngine.nodes);
                        if (node) {
                            window.mindmapEngine.editNode(window.currentEditingNode, node.title);
                        }
                    }
                };
                reader.readAsDataURL(file);
            });
        }
        input.value = ''; // Reset input
    }

    togglePanel() {
        const inputPanel = document.getElementById('inputPanel');
        const projectsPanel = document.getElementById('projectsPanel');
        const btn = document.getElementById('togglePanelBtn');
        this.panelVisible = !this.panelVisible;

        if (this.panelVisible) {
            // Show both panels
            inputPanel.classList.remove('collapsed');
            projectsPanel.classList.remove('collapsed');
            btn.classList.remove('panel-hidden');
            btn.innerHTML = '◀◀';
            btn.style.left = '520px';
        } else {
            // Hide both panels
            inputPanel.classList.add('collapsed');
            projectsPanel.classList.add('collapsed');
            btn.classList.add('panel-hidden');
            btn.innerHTML = '▶▶';
            btn.style.left = '0';
        }
    }

    toggleHeader() {
        const header = document.querySelector('.header');
        const mainContent = document.querySelector('.main-content');
        const btn = document.getElementById('toggleHeaderBtn');

        this.headerVisible = !this.headerVisible;

        if (this.headerVisible) {
            // Show header
            header.classList.remove('collapsed');
            mainContent.classList.remove('header-collapsed');
            btn.classList.remove('header-hidden');
            btn.innerHTML = '▲▲';
            btn.style.top = '90px';
        } else {
            // Hide header
            header.classList.add('collapsed');
            mainContent.classList.add('header-collapsed');
            btn.classList.add('header-hidden');
            btn.innerHTML = '▼▼';
            btn.style.top = '38px';
        }

        // Force canvas redraw after animation
        setTimeout(() => {
            if (this.currentMindmap) {
                this.currentMindmap.redrawConnections();
            }
        }, 300);
    }

    resetView() {
        const wrapper = document.getElementById('mindmapWrapper');
        const container = document.getElementById('mindmapContainer');
        this.scale = 1.0;
        wrapper.style.transform = `scale(${this.scale})`;
        wrapper.style.transformOrigin = '300px 1500px';
        container.scrollTo(0, 1300);
    }

    centerView() {
        const container = document.getElementById('mindmapContainer');
        const wrapper = document.getElementById('mindmapWrapper');

        // Center on the root node position (300, 1500)
        const centerX = 300 - (container.clientWidth / 2);
        const centerY = 1500 - (container.clientHeight / 2);

        container.scrollTo({
            left: Math.max(0, centerX),
            top: Math.max(0, centerY),
            behavior: 'smooth'
        });
    }

    zoomIn() {
        const wrapper = document.getElementById('mindmapWrapper');
        const container = document.getElementById('mindmapContainer');

        this.scale *= 1.15;
        this.scale = Math.min(this.scale, 3);

        // Maintain center point
        const centerX = container.scrollLeft + container.clientWidth / 2;
        const centerY = container.scrollTop + container.clientHeight / 2;

        wrapper.style.transformOrigin = `${centerX}px ${centerY}px`;
        wrapper.style.transform = `scale(${this.scale})`;

        window.mindmapEngine.isDirty = true;
    }

    zoomOut() {
        const wrapper = document.getElementById('mindmapWrapper');
        const container = document.getElementById('mindmapContainer');

        this.scale *= 0.85;
        this.scale = Math.max(this.scale, 0.3);

        // Maintain center point
        const centerX = container.scrollLeft + container.clientWidth / 2;
        const centerY = container.scrollTop + container.clientHeight / 2;

        wrapper.style.transformOrigin = `${centerX}px ${centerY}px`;
        wrapper.style.transform = `scale(${this.scale})`;

        window.mindmapEngine.isDirty = true;
    }

    resetZoom() {
        this.scale = 1.0;
        document.getElementById('mindmapWrapper').style.transform = `scale(${this.scale})`;
    }

    exportData() {
        const exportObj = window.mindmapEngine.exportData();
        const dataStr = JSON.stringify(exportObj, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const link = document.createElement('a');
        link.setAttribute('href', dataUri);
        link.setAttribute('download', `mindmap-${Date.now()}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    exportImage() {
        // Create a temporary canvas for export
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size (you might want to adjust this based on your mindmap size)
        canvas.width = 2000;
        canvas.height = 1500;

        // Draw background
        ctx.fillStyle = '#fafaf8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // This is a simplified export - you'd need to implement proper node rendering to canvas
        alert('Exportación de imagen en desarrollo. Por ahora usa la captura de pantalla del sistema.');
    }

    closeModal() {
        document.getElementById('editModal').classList.remove('active');
        document.getElementById('modalOverlay').classList.remove('active');
    }

    hideContextMenu() {
        document.getElementById('contextMenu').classList.remove('active');
    }

    showShortcuts() {
        document.getElementById('shortcutsModal').classList.add('active');
        document.getElementById('modalOverlay').classList.add('active');
    }

    closeShortcuts() {
        document.getElementById('shortcutsModal').classList.remove('active');
        document.getElementById('modalOverlay').classList.remove('active');
    }

    newMindmap() {
        if (confirm('¿Crear un nuevo mapa mental? Se perderán los cambios no guardados.')) {
            document.getElementById('outlineInput').value = '';
            window.mindmapEngine.nodeData = {};
            // Set default content
            document.getElementById('outlineInput').value = `Nuevo Mapa Mental
1. Idea Principal
* Subtema 1
* Subtema 2
2. Segunda Idea
* Desarrollo
* Conclusiones`;
            this.generateMindmap();
        }
    }

    saveFile() {
        if (window.electronAPI) {
            const data = window.mindmapEngine.exportData();
            // This would need to be implemented with proper file dialog
            console.log('Save file functionality would go here');
        }
    }

    saveFileAs() {
        if (window.electronAPI) {
            const data = window.mindmapEngine.exportData();
            // This would trigger the save dialog from main process
            console.log('Save as functionality would go here');
        }
    }

    openFile() {
        // Trigger file open dialog
        document.getElementById('fileInput').click();
    }

    loadFileContent(data) {
        try {
            if (data.path.endsWith('.json') || data.path.endsWith('.pmap')) {
                const parsed = JSON.parse(data.content);
                if (parsed.nodes) {
                    window.mindmapEngine.importData(parsed);
                } else {
                    throw new Error('Invalid mindmap file format');
                }
            } else {
                document.getElementById('outlineInput').value = data.content;
                this.generateMindmap();
            }
        } catch (error) {
            alert(`Error al cargar el archivo: ${error.message}`);
        }
    }

    showFind() {
        const searchTerm = prompt('Buscar nodo:');
        if (searchTerm) {
            this.findAndHighlightNode(searchTerm);
        }
    }

    findAndHighlightNode(searchTerm) {
        const nodes = document.querySelectorAll('.node-text');
        nodes.forEach(node => {
            if (node.textContent.toLowerCase().includes(searchTerm.toLowerCase())) {
                node.parentElement.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                node.parentElement.style.border = '3px solid #DC6900';
                setTimeout(() => {
                    node.parentElement.style.border = '';
                }, 3000);
            }
        });
    }

    showPreferences() {
        alert('Panel de preferencias en desarrollo');
    }

    // Project Management Methods
    loadProjects() {
        // Load projects from localStorage
        const savedProjects = localStorage.getItem('mindmap-projects');
        if (savedProjects) {
            this.projects = JSON.parse(savedProjects);
        }
        // If no saved projects, use the default projects from constructor
        // (this.projects is already initialized in constructor with 5 projects including PwC ones)

        this.renderProjects();
        if (this.projects.length > 0) {
            this.loadProject(this.projects[0].id);
        }
    }

    renderProjects() {
        const projectList = document.getElementById('projectList');
        projectList.innerHTML = '';

        this.projects.forEach(project => {
            const projectItem = document.createElement('div');
            projectItem.className = 'project-item';
            projectItem.textContent = project.name;
            projectItem.dataset.id = project.id;

            if (this.currentProject === project.id) {
                projectItem.classList.add('active');
            }

            projectItem.addEventListener('click', () => {
                this.loadProject(project.id);
            });

            projectList.appendChild(projectItem);
        });
    }

    loadProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        // Save current project's nodeData before switching
        if (this.currentProject) {
            localStorage.setItem(`mindmap-nodedata-${this.currentProject}`,
                JSON.stringify(window.mindmapEngine.nodeData));
        }

        this.currentProject = projectId;

        // Load nodeData for the new project (or start fresh)
        const savedNodeData = localStorage.getItem(`mindmap-nodedata-${projectId}`);
        if (savedNodeData) {
            try {
                window.mindmapEngine.nodeData = JSON.parse(savedNodeData);
            } catch (e) {
                console.error('Error loading nodeData:', e);
                window.mindmapEngine.nodeData = {};
            }
        } else {
            window.mindmapEngine.nodeData = {};
        }

        document.getElementById('outlineInput').value = project.content;
        this.renderProjects();
        this.generateMindmap();
    }

    addNewProject() {
        const name = prompt('Nombre del nuevo proyecto:');
        if (!name) return;

        const newProject = {
            id: 'project-' + Date.now(),
            name: name,
            content: `${name}
1. Idea Principal
* Subtema 1
* Subtema 2`
        };

        this.projects.push(newProject);
        this.saveProjects();
        this.renderProjects();
        this.loadProject(newProject.id);
    }

    saveProjects() {
        // Save current project content
        if (this.currentProject) {
            const project = this.projects.find(p => p.id === this.currentProject);
            if (project) {
                project.content = document.getElementById('outlineInput').value;
            }
        }

        localStorage.setItem('mindmap-projects', JSON.stringify(this.projects));
    }

    // View Mode Management
    switchViewMode(mode) {
        // Set body data attribute
        document.body.dataset.viewMode = mode;

        // Update button active states
        const editBtn = document.getElementById('editModeBtn');
        const presentBtn = document.getElementById('presentModeBtn');

        if (mode === 'edit') {
            editBtn.classList.add('active');
            presentBtn.classList.remove('active');
        } else {
            editBtn.classList.remove('active');
            presentBtn.classList.add('active');
        }

        // Save preference
        localStorage.setItem('mindmap-view-mode', mode);

        // Update help text
        const helpText = document.getElementById('helpText');
        if (mode === 'presentation') {
            helpText.textContent = '💡 Clic en nodos: Expandir/Colapsar | Info: Ver detalles | ⌘+scroll: Zoom';
        } else {
            helpText.textContent = '💡 Doble clic: Editar nodo | Clic derecho: Menú contextual | ⌘+scroll: Zoom';
        }
    }

    loadViewMode() {
        const savedMode = localStorage.getItem('mindmap-view-mode') || 'edit';
        this.switchViewMode(savedMode);
    }
}

// Initialize renderer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mindmapRenderer = new MindmapRenderer();

    // Load saved view mode
    window.mindmapRenderer.loadViewMode();

    // Auto-save project content when textarea changes
    document.getElementById('outlineInput').addEventListener('input', () => {
        if (window.mindmapRenderer) {
            window.mindmapRenderer.saveProjects();
        }
    });
});