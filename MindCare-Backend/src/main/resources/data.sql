INSERT INTO roles (id_rol, nombre) VALUES (1, 'ADMIN') ON CONFLICT (id_rol) DO NOTHING;
INSERT INTO roles (id_rol, nombre) VALUES (2, 'PACIENTE') ON CONFLICT (id_rol) DO NOTHING;
INSERT INTO roles (id_rol, nombre) VALUES (3, 'PROFESIONAL') ON CONFLICT (id_rol) DO NOTHING;

INSERT INTO estados_cita (id_estado_cita, nombre) VALUES (1, 'PENDIENTE') ON CONFLICT (id_estado_cita) DO NOTHING;
INSERT INTO estados_cita (id_estado_cita, nombre) VALUES (2, 'CONFIRMADA') ON CONFLICT (id_estado_cita) DO NOTHING;
INSERT INTO estados_cita (id_estado_cita, nombre) VALUES (3, 'REPROGRAMADA') ON CONFLICT (id_estado_cita) DO NOTHING;
INSERT INTO estados_cita (id_estado_cita, nombre) VALUES (4, 'CANCELADO') ON CONFLICT (id_estado_cita) DO NOTHING;
INSERT INTO estados_cita (id_estado_cita, nombre) VALUES (5, 'FINALIZADA') ON CONFLICT (id_estado_cita) DO NOTHING;

INSERT INTO estados_animo (id_estado_animo, nombre, descripcion) VALUES (1, 'Tranquilo', 'Estado emocional estable') ON CONFLICT (id_estado_animo) DO NOTHING;
INSERT INTO estados_animo (id_estado_animo, nombre, descripcion) VALUES (2, 'Ansioso', 'Sensacion de ansiedad o inquietud') ON CONFLICT (id_estado_animo) DO NOTHING;
INSERT INTO estados_animo (id_estado_animo, nombre, descripcion) VALUES (3, 'Triste', 'Estado de animo bajo') ON CONFLICT (id_estado_animo) DO NOTHING;
INSERT INTO estados_animo (id_estado_animo, nombre, descripcion) VALUES (4, 'Motivado', 'Estado positivo y activo') ON CONFLICT (id_estado_animo) DO NOTHING;

INSERT INTO preguntas (id_pregunta, texto) VALUES (1, 'Como describirias tu estado emocional actual?') ON CONFLICT (id_pregunta) DO NOTHING;
INSERT INTO preguntas (id_pregunta, texto) VALUES (2, 'Que tan intensa fue tu emocion principal hoy?') ON CONFLICT (id_pregunta) DO NOTHING;
INSERT INTO preguntas (id_pregunta, texto) VALUES (3, 'Dormiste adecuadamente?') ON CONFLICT (id_pregunta) DO NOTHING;
INSERT INTO preguntas (id_pregunta, texto) VALUES (4, 'Tuviste pensamientos negativos recurrentes?') ON CONFLICT (id_pregunta) DO NOTHING;

INSERT INTO especialidades (id_especialidad, nombre, descripcion) VALUES (1, 'Psicologia clinica', 'Atencion psicologica clinica') ON CONFLICT (id_especialidad) DO NOTHING;
INSERT INTO especialidades (id_especialidad, nombre, descripcion) VALUES (2, 'Psiquiatria', 'Atencion medica especializada en salud mental') ON CONFLICT (id_especialidad) DO NOTHING;
INSERT INTO especialidades (id_especialidad, nombre, descripcion) VALUES (3, 'Terapia familiar', 'Intervencion familiar y de pareja') ON CONFLICT (id_especialidad) DO NOTHING;
INSERT INTO especialidades (id_especialidad, nombre, descripcion) VALUES (4, 'Mindfulness', 'Tecnicas de atencion plena y regulacion emocional') ON CONFLICT (id_especialidad) DO NOTHING;

INSERT INTO roles (id_rol, nombre) VALUES (1, 'ADMIN') ON CONFLICT (id_rol) DO NOTHING;
INSERT INTO roles (id_rol, nombre) VALUES (2, 'PACIENTE') ON CONFLICT (id_rol) DO NOTHING;
INSERT INTO roles (id_rol, nombre) VALUES (3, 'PROFESIONAL') ON CONFLICT (id_rol) DO NOTHING;

INSERT INTO estados_cita (id_estado_cita, nombre) VALUES (1, 'PENDIENTE') ON CONFLICT (id_estado_cita) DO NOTHING;
INSERT INTO estados_cita (id_estado_cita, nombre) VALUES (2, 'CONFIRMADA') ON CONFLICT (id_estado_cita) DO NOTHING;
INSERT INTO estados_cita (id_estado_cita, nombre) VALUES (3, 'REPROGRAMADA') ON CONFLICT (id_estado_cita) DO NOTHING;
INSERT INTO estados_cita (id_estado_cita, nombre) VALUES (4, 'CANCELADO') ON CONFLICT (id_estado_cita) DO NOTHING;
INSERT INTO estados_cita (id_estado_cita, nombre) VALUES (5, 'FINALIZADA') ON CONFLICT (id_estado_cita) DO NOTHING;

INSERT INTO estados_animo (id_estado_animo, nombre, descripcion) VALUES (1, 'Tranquilo', 'Estado emocional estable') ON CONFLICT (id_estado_animo) DO NOTHING;
INSERT INTO estados_animo (id_estado_animo, nombre, descripcion) VALUES (2, 'Ansioso', 'Sensacion de ansiedad o inquietud') ON CONFLICT (id_estado_animo) DO NOTHING;
INSERT INTO estados_animo (id_estado_animo, nombre, descripcion) VALUES (3, 'Triste', 'Estado de animo bajo') ON CONFLICT (id_estado_animo) DO NOTHING;
INSERT INTO estados_animo (id_estado_animo, nombre, descripcion) VALUES (4, 'Motivado', 'Estado positivo y activo') ON CONFLICT (id_estado_animo) DO NOTHING;

INSERT INTO preguntas (id_pregunta, texto) VALUES (1, 'Como describirias tu estado emocional actual?') ON CONFLICT (id_pregunta) DO NOTHING;
INSERT INTO preguntas (id_pregunta, texto) VALUES (2, 'Que tan intensa fue tu emocion principal hoy?') ON CONFLICT (id_pregunta) DO NOTHING;
INSERT INTO preguntas (id_pregunta, texto) VALUES (3, 'Dormiste adecuadamente?') ON CONFLICT (id_pregunta) DO NOTHING;
INSERT INTO preguntas (id_pregunta, texto) VALUES (4, 'Tuviste pensamientos negativos recurrentes?') ON CONFLICT (id_pregunta) DO NOTHING;

INSERT INTO especialidades (id_especialidad, nombre, descripcion) VALUES (1, 'Psicologia clinica', 'Atencion psicologica clinica') ON CONFLICT (id_especialidad) DO NOTHING;
INSERT INTO especialidades (id_especialidad, nombre, descripcion) VALUES (2, 'Psiquiatria', 'Atencion medica especializada en salud mental') ON CONFLICT (id_especialidad) DO NOTHING;
INSERT INTO especialidades (id_especialidad, nombre, descripcion) VALUES (3, 'Terapia familiar', 'Intervencion familiar y de pareja') ON CONFLICT (id_especialidad) DO NOTHING;
INSERT INTO especialidades (id_especialidad, nombre, descripcion) VALUES (4, 'Mindfulness', 'Tecnicas de atencion plena y regulacion emocional') ON CONFLICT (id_especialidad) DO NOTHING;

/* =========================
   USUARIOS BASE
   Password para todos: 123456
========================= */

INSERT INTO usuarios (
    id_usuario,
    nombre,
    username,
    correo,
    password,
    verificado,
    fecha_registro,
    activo,
    ultimo_acceso,
    id_rol
)
VALUES (
           1,
           'Administrador MindCare',
           'admin_mindcare',
           'admin@mindcare.com',
           '$2a$12$1k34YdrmxBkVborQvZLh2OUvX1S80GVVQjZJ5H55y1eez7XV.nV06',
           true,
           CURRENT_TIMESTAMP,
           true,
           CURRENT_TIMESTAMP,
           1
       )
ON CONFLICT (id_usuario) DO NOTHING;

/* =========================
   USUARIO PACIENTE
   Password: 123456
========================= */

INSERT INTO usuarios (
    id_usuario,
    nombre,
    username,
    correo,
    password,
    verificado,
    fecha_registro,
    activo,
    ultimo_acceso,
    id_rol
)
VALUES (
           2,
           'Paciente MindCare',
           'paciente_mindcare',
           'paciente@mindcare.com',
           '$2a$12$1k34YdrmxBkVborQvZLh2OUvX1S80GVVQjZJ5H55y1eez7XV.nV06',
           true,
           CURRENT_TIMESTAMP,
           true,
           CURRENT_TIMESTAMP,
           2
       )
ON CONFLICT (id_usuario) DO NOTHING;

INSERT INTO pacientes (
    id_paciente,
    edad,
    genero,
    fecha_nacimiento,
    telefono,
    contacto_emergencia,
    id_usuario
)
VALUES (
           1,
           20,
           'Masculino',
           '2005-05-10',
           '999999999',
           '987654321',
           2
       )
ON CONFLICT (id_paciente) DO NOTHING;


/* =========================
   USUARIO PROFESIONAL
   Password: 123456
========================= */

INSERT INTO usuarios (
    id_usuario,
    nombre,
    username,
    correo,
    password,
    verificado,
    fecha_registro,
    activo,
    ultimo_acceso,
    id_rol
)
VALUES (
           3,
           'Profesional MindCare',
           'profesional_mindcare',
           'profesional@mindcare.com',
           '$2a$12$1k34YdrmxBkVborQvZLh2OUvX1S80GVVQjZJ5H55y1eez7XV.nV06',
           true,
           CURRENT_TIMESTAMP,
           true,
           CURRENT_TIMESTAMP,
           3
       )
ON CONFLICT (id_usuario) DO NOTHING;

INSERT INTO profesionales (
    id_profesional,
    especialidad,
    numero_colegiatura,
    etiquetas,
    anios_experiencia,
    descripcion_perfil,
    documento_validacion,
    estado_validacion,
    motivo_rechazo,
    fecha_solicitud,
    fecha_validacion,
    id_usuario
)
VALUES (
           1,
           'Psicologia clinica',
           'CPSP-12345',
           'ansiedad, estres, terapia cognitivo-conductual',
           5,
           'Profesional especializado en salud mental y bienestar emocional.',
           'documento-validacion.pdf',
           'APROBADO',
           NULL,
           CURRENT_TIMESTAMP,
           CURRENT_TIMESTAMP,
           3
       )
ON CONFLICT (id_profesional) DO NOTHING;
