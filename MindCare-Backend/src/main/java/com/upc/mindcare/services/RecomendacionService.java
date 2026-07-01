package com.upc.mindcare.services;

import com.upc.mindcare.dtos.RecomendacionDTO;
import com.upc.mindcare.entities.Encuesta;
import com.upc.mindcare.entities.Tracking;
import com.upc.mindcare.interfaces.IRecomendacionService;
import com.upc.mindcare.repositories.EncuestaRepositorio;
import com.upc.mindcare.repositories.PacienteRepositorio;
import com.upc.mindcare.repositories.TrackingRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
public class RecomendacionService implements IRecomendacionService {

    @Autowired
    private TrackingRepositorio trackingRepositorio;

    @Autowired
    private EncuestaRepositorio encuestaRepositorio;

    @Autowired
    private PacienteRepositorio pacienteRepositorio;

    @Override
    //Implementar recomendaciones personalizadas en service
    public RecomendacionDTO generarRecomendacionesPersonalizadas(Long pacienteId) {
        validarPacienteExiste(pacienteId);

        List<Tracking> trackings = trackingRepositorio.findByPaciente_PacienteIdOrderByFechaAsc(pacienteId);
        List<Encuesta> encuestas = encuestaRepositorio.findByPaciente_PacienteId(pacienteId);
        encuestas.sort(Comparator.comparing(Encuesta::getFechaRegistro, Comparator.nullsLast(Comparator.naturalOrder())));

        RecomendacionDTO dto = new RecomendacionDTO();
        dto.setPacienteId(pacienteId);
        dto.setFactoresDetectados(new ArrayList<>());
        dto.setRecomendaciones(new ArrayList<>());
        dto.setAccionesSugeridas(new ArrayList<>());

        if (trackings.isEmpty() && encuestas.isEmpty()) {
            dto.setEstadoEmocional("Sin datos");
            dto.setNivelRiesgo("SIN_DATOS");
            dto.setTendencia("Sin historial suficiente");
            dto.setPuntajeRiesgo(0);
            dto.setMensajePrincipal("Aun no hay registros suficientes para generar recomendaciones personalizadas.");
            dto.getRecomendaciones().add("Registra tu estado emocional y completa una encuesta diaria para activar el analisis personalizado.");
            dto.getAccionesSugeridas().add("Registrar estado emocional");
            dto.getAccionesSugeridas().add("Responder encuesta diaria");
            dto.setRequiereAtencionProfesional(false);
            dto.setAlertaPreventiva("Sin alertas.");
            return dto;
        }

        Tracking ultimoTracking = obtenerUltimoTracking(trackings);
        Encuesta ultimaEncuesta = obtenerUltimaEncuesta(encuestas);
        Integer ultimaIntensidad = ultimoTracking != null ? obtenerIntensidadValida(ultimoTracking) : null;
        Integer ultimoBienestar = ultimaEncuesta != null ? normalizarBienestar(ultimaEncuesta.getResultadoTotal()) : null;
        double promedioIntensidad = promedioIntensidad(trackings);
        double promedioBienestar = promedioBienestar(encuestas);
        String tendencia = calcularTendencia(trackings, encuestas);
        int bienestarEmocional = calcularBienestarEmocional(ultimoTracking, ultimoBienestar);
        int puntajeRiesgo = calcularPuntajeRiesgo(ultimoTracking, bienestarEmocional, ultimoBienestar, promedioIntensidad, promedioBienestar, tendencia);
        String nivelRiesgo = calcularNivelRiesgo(puntajeRiesgo);

        dto.setUltimaIntensidad(ultimaIntensidad);
        dto.setUltimoBienestar(bienestarEmocional);
        dto.setPromedioIntensidad(redondear(promedioIntensidad));
        dto.setPromedioBienestar(redondear(promedioBienestar));
        dto.setTendencia(tendencia);
        dto.setPuntajeRiesgo(puntajeRiesgo);
        dto.setNivelRiesgo(nivelRiesgo);
        dto.setEstadoEmocional(calcularEstadoEmocional(nivelRiesgo, ultimaIntensidad, bienestarEmocional));
        dto.setRequiereAtencionProfesional("ALTO".equals(nivelRiesgo) || "CRITICO".equals(nivelRiesgo));
        dto.setAlertaPreventiva(generarAlertaPreventiva(pacienteId));

        completarFactores(dto, ultimaIntensidad, bienestarEmocional, promedioIntensidad, promedioBienestar, tendencia, ultimoTracking);
        completarRecomendaciones(dto, nivelRiesgo, tendencia);
        dto.setMensajePrincipal(generarMensajePrincipal(dto));

        return dto;
    }

    //Implementar metodo evaluarEstadoEmocional en EncuestaService
    @Override
    public String evaluarEstadoEmocional(Long pacienteId) {
        RecomendacionDTO dto = generarRecomendacionesPersonalizadas(pacienteId);
        if ("SIN_DATOS".equals(dto.getNivelRiesgo())) {
            return "Estado emocional desconocido.";
        }
        return dto.getEstadoEmocional() + ". Riesgo " + dto.getNivelRiesgo().toLowerCase(Locale.ROOT) + ".";
    }

    @Override
    public String generarAlertaPreventiva(Long pacienteId) {
        validarPacienteExiste(pacienteId);

        List<Tracking> lista = trackingRepositorio.findByPaciente_PacienteIdOrderByFechaAsc(pacienteId);
        if (lista.size() < 3) {
            return "No hay suficientes datos para generar alerta.";
        }

        int contadorAlto = 0;
        for (int i = Math.max(0, lista.size() - 3); i < lista.size(); i++) {
            Tracking tracking = lista.get(i);
            String estado = tracking.getEstadoAnimo() != null && tracking.getEstadoAnimo().getNombre() != null
                    ? tracking.getEstadoAnimo().getNombre().toLowerCase(Locale.ROOT)
                    : "";
            int bienestar = calcularBienestarEmocional(tracking, null);
            if (bienestar <= 40 || (tracking.getNumeroIntensidad() != null && esEstadoNegativo(estado) && obtenerIntensidadValida(tracking) >= 7)) {
                contadorAlto++;
            }
        }

        if (contadorAlto >= 2) {
            return "ALERTA: Se detectan niveles emocionales elevados en registros recientes. Se recomienda seguimiento profesional.";
        }

        return "Sin alertas.";
    }

    private void validarPacienteExiste(Long pacienteId) {
        pacienteRepositorio.findById(pacienteId)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
    }

    private Tracking obtenerUltimoTracking(List<Tracking> lista) {
        if (lista == null || lista.isEmpty()) {
            return null;
        }
        return lista.get(lista.size() - 1);
    }

    private Encuesta obtenerUltimaEncuesta(List<Encuesta> lista) {
        if (lista == null || lista.isEmpty()) {
            return null;
        }
        return lista.get(lista.size() - 1);
    }

    private int obtenerIntensidadValida(Tracking tracking) {
        if (tracking.getNumeroIntensidad() == null) {
            throw new RuntimeException("El registro emocional no tiene intensidad asignada");
        }

        int intensidad = tracking.getNumeroIntensidad();
        if (intensidad < 1 || intensidad > 10) {
            throw new RuntimeException("La intensidad emocional debe estar entre 1 y 10");
        }
        return intensidad;
    }

    private int normalizarBienestar(Integer bienestar) {
        if (bienestar == null) {
            return 0;
        }
        return Math.max(0, Math.min(100, bienestar));
    }

    private double promedioIntensidad(List<Tracking> lista) {
        return lista.stream()
                .filter(t -> t.getNumeroIntensidad() != null)
                .mapToInt(this::obtenerIntensidadValida)
                .average()
                .orElse(0);
    }

    private double promedioBienestar(List<Encuesta> lista) {
        return lista.stream()
                .filter(e -> e.getResultadoTotal() != null)
                .mapToInt(e -> normalizarBienestar(e.getResultadoTotal()))
                .average()
                .orElse(0);
    }

    private String calcularTendencia(List<Tracking> trackings, List<Encuesta> encuestas) {
        if (trackings.size() >= 2) {
            int actual = calcularBienestarEmocional(trackings.get(trackings.size() - 1), null);
            int anterior = calcularBienestarEmocional(trackings.get(trackings.size() - 2), null);
            if (actual <= anterior - 15) {
                return "Deterioro emocional reciente";
            }
            if (actual >= anterior + 15) {
                return "Mejora emocional reciente";
            }
        }

        if (encuestas.size() >= 2) {
            int actual = normalizarBienestar(encuestas.get(encuestas.size() - 1).getResultadoTotal());
            int anterior = normalizarBienestar(encuestas.get(encuestas.size() - 2).getResultadoTotal());
            if (actual <= anterior - 15) {
                return "Disminucion de bienestar reciente";
            }
            if (actual >= anterior + 15) {
                return "Mejora de bienestar reciente";
            }
        }

        return "Estable";
    }

    private int calcularBienestarEmocional(Tracking tracking, Integer bienestarEncuesta) {
        if (tracking == null || tracking.getNumeroIntensidad() == null) {
            return bienestarEncuesta != null ? normalizarBienestar(bienestarEncuesta) : 0;
        }

        int intensidad = obtenerIntensidadValida(tracking);
        String estado = tracking.getEstadoAnimo() != null && tracking.getEstadoAnimo().getNombre() != null
                ? tracking.getEstadoAnimo().getNombre().toLowerCase(Locale.ROOT)
                : "";

        if (esEstadoNegativo(estado)) {
            return Math.max(0, Math.min(100, (11 - intensidad) * 10));
        }

        if (esEstadoPositivo(estado)) {
            return Math.max(0, Math.min(100, intensidad * 10));
        }

        return bienestarEncuesta != null ? normalizarBienestar(bienestarEncuesta) : Math.max(0, Math.min(100, intensidad * 10));
    }

    private int calcularPuntajeRiesgo(Tracking ultimoTracking, Integer bienestarEmocional, Integer ultimoBienestarEncuesta, double promedioIntensidad, double promedioBienestar, String tendencia) {
        int puntaje = 0;
        String estado = ultimoTracking != null && ultimoTracking.getEstadoAnimo() != null && ultimoTracking.getEstadoAnimo().getNombre() != null
                ? ultimoTracking.getEstadoAnimo().getNombre().toLowerCase(Locale.ROOT)
                : "";

        if (bienestarEmocional != null) {
            puntaje += Math.max(0, 100 - bienestarEmocional) / 2;
        }

        if (ultimoTracking != null && ultimoTracking.getNumeroIntensidad() != null && esEstadoNegativo(estado)) {
            int intensidad = obtenerIntensidadValida(ultimoTracking);
            puntaje += intensidad >= 8 ? 25 : intensidad >= 6 ? 15 : 6;
        }

        if (ultimoBienestarEncuesta != null) {
            puntaje += Math.max(0, 100 - normalizarBienestar(ultimoBienestarEncuesta)) / 4;
        }

        if (promedioBienestar > 0 && promedioBienestar < 45) {
            puntaje += 15;
        } else if (promedioBienestar > 0 && promedioBienestar < 65) {
            puntaje += 8;
        }

        if (promedioIntensidad >= 7 && esEstadoNegativo(estado)) {
            puntaje += 10;
        }

        if (tendencia.toLowerCase(Locale.ROOT).contains("deterioro") || tendencia.toLowerCase(Locale.ROOT).contains("disminucion")) {
            puntaje += 12;
        }

        return Math.max(0, Math.min(100, puntaje));
    }

    private boolean esEstadoPositivo(String estado) {
        return estado.contains("feliz")
                || estado.contains("tranquilo")
                || estado.contains("motivado")
                || estado.contains("calma");
    }

    private boolean esEstadoNegativo(String estado) {
        return estado.contains("ansioso")
                || estado.contains("triste")
                || estado.contains("estresado")
                || estado.contains("estres")
                || estado.contains("miedo")
                || estado.contains("ira");
    }

    private String calcularNivelRiesgo(int puntaje) {
        if (puntaje >= 80) {
            return "CRITICO";
        }
        if (puntaje >= 60) {
            return "ALTO";
        }
        if (puntaje >= 35) {
            return "MODERADO";
        }
        return "BAJO";
    }

    private String calcularEstadoEmocional(String nivelRiesgo, Integer ultimaIntensidad, Integer ultimoBienestar) {
        if ("CRITICO".equals(nivelRiesgo) || "ALTO".equals(nivelRiesgo)) {
            return "Seguimiento prioritario";
        }
        if ("MODERADO".equals(nivelRiesgo)) {
            return "En observacion";
        }
        if (ultimaIntensidad == null && ultimoBienestar == null) {
            return "Sin datos";
        }
        return "Estable";
    }

    private void completarFactores(RecomendacionDTO dto, Integer ultimaIntensidad, Integer bienestarEmocional, double promedioIntensidad, double promedioBienestar, String tendencia, Tracking ultimoTracking) {
        if (ultimaIntensidad != null) {
            dto.getFactoresDetectados().add("Ultima intensidad emocional: " + ultimaIntensidad + "/10");
        }
        if (bienestarEmocional != null) {
            dto.getFactoresDetectados().add("Bienestar emocional calculado: " + bienestarEmocional + "%");
        }
        if (promedioIntensidad > 0) {
            dto.getFactoresDetectados().add("Promedio reciente de intensidad: " + redondear(promedioIntensidad) + "/10");
        }
        if (promedioBienestar > 0) {
            dto.getFactoresDetectados().add("Promedio de bienestar en encuestas: " + redondear(promedioBienestar) + "%");
        }
        dto.getFactoresDetectados().add("Tendencia detectada: " + tendencia);
        if (ultimoTracking != null && ultimoTracking.getEstadoAnimo() != null && ultimoTracking.getEstadoAnimo().getNombre() != null) {
            dto.getFactoresDetectados().add("Estado de animo reciente: " + ultimoTracking.getEstadoAnimo().getNombre());
        }
    }

    private void completarRecomendaciones(RecomendacionDTO dto, String nivelRiesgo, String tendencia) {
        if ("CRITICO".equals(nivelRiesgo) || "ALTO".equals(nivelRiesgo)) {
            dto.getRecomendaciones().add("Agenda o confirma una cita con un profesional para seguimiento cercano.");
            dto.getRecomendaciones().add("Realiza una tecnica de respiracion guiada durante 5 minutos y evita sobrecargarte hoy.");
            dto.getRecomendaciones().add("Registra nuevamente tu estado emocional al final del dia para comparar la evolucion.");
            dto.getAccionesSugeridas().add("Agendar cita");
            dto.getAccionesSugeridas().add("Registrar estado emocional");
            return;
        }

        if ("MODERADO".equals(nivelRiesgo)) {
            dto.getRecomendaciones().add("Haz una pausa breve, identifica el detonante principal y registra una reflexion corta.");
            dto.getRecomendaciones().add("Completa la encuesta diaria para mejorar la precision del analisis.");
            dto.getRecomendaciones().add("Mantente atento si la tendencia continua bajando en los proximos registros.");
            dto.getAccionesSugeridas().add("Responder encuesta diaria");
            dto.getAccionesSugeridas().add("Registrar reflexion emocional");
            return;
        }

        dto.getRecomendaciones().add("Mantener habitos de descanso, respiracion y registro emocional diario.");
        dto.getRecomendaciones().add("Revisa tu historial semanal para reconocer patrones positivos.");
        if (tendencia.toLowerCase(Locale.ROOT).contains("mejora")) {
            dto.getRecomendaciones().add("Conserva las actividades que coincidieron con esta mejora reciente.");
        }
        dto.getAccionesSugeridas().add("Continuar seguimiento");
    }

    private String generarMensajePrincipal(RecomendacionDTO dto) {
        if ("CRITICO".equals(dto.getNivelRiesgo()) || "ALTO".equals(dto.getNivelRiesgo())) {
            return "El analisis detecta indicadores elevados. Se recomienda apoyo profesional y seguimiento cercano.";
        }
        if ("MODERADO".equals(dto.getNivelRiesgo())) {
            return "Se observan senales moderadas. Conviene reforzar autocuidado y continuar registrando tu evolucion.";
        }
        return "Tus indicadores se mantienen estables. Continua con tus habitos de bienestar y seguimiento diario.";
    }

    private double redondear(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}

