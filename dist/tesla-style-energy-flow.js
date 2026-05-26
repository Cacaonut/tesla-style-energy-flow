/* Tesla Style Energy Flow
 * Public Home Assistant custom card with configurable sensors, background, and flow paths.
 */
(function () {
  const CARD_TYPE = 'tesla-style-energy-flow';
  const FLOW_MIN_W = 50;
  const EDITOR_UPDATE_DEBOUNCE_MS = 500;
  const SUPPORTED_LANGS = ['it', 'en', 'es', 'fr', 'de'];
  const DEFAULT_LANG = 'it';
  const LANGUAGE_OPTIONS = Object.freeze([
    { value: 'auto', labelKey: 'editor.lang_auto' },
    { value: 'it', labelKey: 'editor.lang_it' },
    { value: 'en', labelKey: 'editor.lang_en' },
    { value: 'es', labelKey: 'editor.lang_es' },
    { value: 'fr', labelKey: 'editor.lang_fr' },
    { value: 'de', labelKey: 'editor.lang_de' }
  ]);
  const COMPACT_VALUE_ROW = Object.freeze({
    arrowOffsetX: 8,
    percentOffsetX: 16
  });
  const GUIDE_ALIGNED_TEXT_PAIRS = Object.freeze([
    ['#flow-solar-label', '#flow-solar-power', '#flow-solar-guide'],
    ['#flow-grid-label', '#flow-grid-power', '#flow-grid-guide'],
    ['#flow-load-label', '#flow-load-power', '#flow-load-guide'],
    ['#flow-ev-label', '#flow-ev-power', '#flow-ev-guide'],
    ['#flow-ev2-label', '#flow-ev2-power', '#flow-ev2-guide']
  ]);
  const GUIDE_CLEARANCE_TEXT_PAIRS = Object.freeze([
    ...GUIDE_ALIGNED_TEXT_PAIRS,
    ['#flow-battery-label', '#flow-battery-power', '#flow-battery-guide']
  ]);
  const GUIDE_TEXT_CLEARANCE = Object.freeze({
    base: 8,
    scaleExtra: 6
  });
  const VIEWBOX_TEXT_FIT = Object.freeze({
    margin: 18,
    labelPowerGap: 22
  });
  const I18N = Object.freeze({
    it: {
      card: {
        default_title: 'Flusso Energia',
        node: {
          solar: 'Solare',
          grid: 'Rete',
          home: 'Casa',
          battery: 'Batteria',
          ev: 'EV'
        },
        status: {
          inactive: 'INATTIVO',
          connected: 'CONNESSA',
          consuming: 'IN CONSUMO',
          waiting: 'IN ATTESA',
          off: 'OFF',
          producing: 'IN PRODUZIONE',
          charging: 'IN CARICA',
          discharging: 'IN SCARICA'
        }
      },
      editor: {
        section_general: 'Generale',
        field_title: 'Titolo',
        field_language: 'Lingua',
        field_background: 'Background URL',
        field_background_base: 'Background Assets Base (auto)',
        field_grid_invert: 'Inverti segno rete',
        field_show_labels: 'Mostra etichette',
        field_hide_ev_idle: 'Nascondi EV se non in carica',
        field_scene_scale: 'Scene Scale',
        field_solar_threshold: 'Soglia Solar (W)',
        field_grid_threshold: 'Soglia Grid (W)',
        field_battery_threshold: 'Soglia Battery (W)',
        section_sensors: 'Sensori',
        sensor_solar: 'Solar Power',
        sensor_grid: 'Grid Power',
        sensor_battery: 'Battery Power',
        sensor_battery_charge: 'Potenza Carica Batteria',
        sensor_battery_discharge: 'Potenza Scarica Batteria',
        sensor_load: 'Load Power',
        sensor_battery_level: 'Battery Level %',
        sensor_ev_power: 'EV Power',
        sensor_ev_battery: 'EV Battery %',
        sensor_ev_switch: 'EV Charge Switch',
        sensor_ev2_power: 'EV 2 Power',
        sensor_ev2_battery: 'EV 2 Battery %',
        sensor_ev2_switch: 'EV 2 Charge Switch',
        sensor_weather: 'Weather Entity',
        sensor_sun: 'Sun Entity',
        hint_entities: 'Menu pulito con entita filtrate per dominio.',
        section_dynamic_bg: 'Background Dinamico',
        field_dynamic_bg: 'Abilita dinamico',
        hint_bg_lookup: 'Priorita lookup: period+meteo+charging -> period+meteo -> period_default -> default -> background.',
        placeholder_select: '-- seleziona --',
        placeholder_sensor: '-- seleziona sensore --',
        placeholder_switch: '-- seleziona switch --',
        placeholder_weather: '-- seleziona weather --',
        placeholder_sun: '-- seleziona sun --',
        lang_auto: 'Automatico (Home Assistant)',
        lang_it: 'Italiano',
        lang_en: 'Inglese',
        lang_es: 'Spagnolo',
        lang_fr: 'Francese',
        lang_de: 'Tedesco',
        position_open_button: 'Modifica visiva',
        position_modal_title: 'Modifica visiva',
        position_modal_kicker: 'Posizioni scena',
        position_close_button: 'Chiudi',
        position_field_scene: 'Scena',
        position_field_label: 'Etichetta',
        position_field_value: 'Valore',
        position_field_guide_a: 'Linea A',
        position_field_guide_b: 'Linea B',
        section_scene_positions: 'Posizioni scena',
        position_hint: 'La percentuale della batteria segue automaticamente il valore in kW. La geometria dei percorsi resta in YAML/JSON.'
      }
    },
    en: {
      card: {
        default_title: 'Tesla Style Energy Flow',
        node: {
          solar: 'Solar',
          grid: 'Grid',
          home: 'Home',
          battery: 'Battery',
          ev: 'EV'
        },
        status: {
          inactive: 'IDLE',
          connected: 'CONNECTED',
          consuming: 'CONSUMING',
          waiting: 'STANDBY',
          off: 'OFF',
          producing: 'PRODUCING',
          charging: 'CHARGING',
          discharging: 'DISCHARGING'
        }
      },
      editor: {
        section_general: 'General',
        field_title: 'Title',
        field_language: 'Language',
        field_background: 'Background URL',
        field_background_base: 'Background Assets Base (auto)',
        field_grid_invert: 'Invert grid sign',
        field_show_labels: 'Show labels',
        field_hide_ev_idle: 'Hide EV when idle',
        field_scene_scale: 'Scene Scale',
        field_solar_threshold: 'Solar threshold (W)',
        field_grid_threshold: 'Grid threshold (W)',
        field_battery_threshold: 'Battery threshold (W)',
        section_sensors: 'Sensors',
        sensor_solar: 'Solar Power',
        sensor_grid: 'Grid Power',
        sensor_battery: 'Battery Power',
        sensor_battery_charge: 'Battery Charge Power',
        sensor_battery_discharge: 'Battery Discharge Power',
        sensor_load: 'Load Power',
        sensor_battery_level: 'Battery Level %',
        sensor_ev_power: 'EV Power',
        sensor_ev_battery: 'EV Battery %',
        sensor_ev_switch: 'EV Charge Switch',
        sensor_ev2_power: 'EV 2 Power',
        sensor_ev2_battery: 'EV 2 Battery %',
        sensor_ev2_switch: 'EV 2 Charge Switch',
        sensor_weather: 'Weather Entity',
        sensor_sun: 'Sun Entity',
        hint_entities: 'Clean menu with domain-filtered entities.',
        section_dynamic_bg: 'Dynamic Background',
        field_dynamic_bg: 'Enable dynamic',
        hint_bg_lookup: 'Lookup priority: period+weather+charging -> period+weather -> period_default -> default -> background.',
        placeholder_select: '-- select --',
        placeholder_sensor: '-- select sensor --',
        placeholder_switch: '-- select switch --',
        placeholder_weather: '-- select weather --',
        placeholder_sun: '-- select sun --',
        lang_auto: 'Automatic (Home Assistant)',
        lang_it: 'Italian',
        lang_en: 'English',
        lang_es: 'Spanish',
        lang_fr: 'French',
        lang_de: 'German',
        position_open_button: 'Edit visually',
        position_modal_title: 'Edit visually',
        position_modal_kicker: 'Scene positions',
        position_close_button: 'Close',
        position_field_scene: 'Scene',
        position_field_label: 'Label',
        position_field_value: 'Value',
        position_field_guide_a: 'Guide A',
        position_field_guide_b: 'Guide B',
        section_scene_positions: 'Scene positions',
        position_hint: 'Battery percent follows the battery kW value automatically. Path geometry stays in YAML/JSON.'
      }
    },
    es: {
      card: {
        default_title: 'Flujo de Energia',
        node: {
          solar: 'Solar',
          grid: 'Red',
          home: 'Casa',
          battery: 'Bateria',
          ev: 'EV'
        },
        status: {
          inactive: 'INACTIVO',
          connected: 'CONECTADA',
          consuming: 'CONSUMIENDO',
          waiting: 'EN ESPERA',
          off: 'OFF',
          producing: 'PRODUCIENDO',
          charging: 'CARGANDO',
          discharging: 'DESCARGANDO'
        }
      },
      editor: {
        section_general: 'General',
        field_title: 'Titulo',
        field_language: 'Idioma',
        field_background: 'URL de fondo',
        field_background_base: 'Base de assets de fondo (auto)',
        field_grid_invert: 'Invertir signo de red',
        field_show_labels: 'Mostrar etiquetas',
        field_hide_ev_idle: 'Ocultar EV si no carga',
        field_scene_scale: 'Escala de escena',
        field_solar_threshold: 'Umbral Solar (W)',
        field_grid_threshold: 'Umbral Red (W)',
        field_battery_threshold: 'Umbral Bateria (W)',
        section_sensors: 'Sensores',
        sensor_solar: 'Potencia Solar',
        sensor_grid: 'Potencia Red',
        sensor_battery: 'Potencia Bateria',
        sensor_battery_charge: 'Potencia Carga Bateria',
        sensor_battery_discharge: 'Potencia Descarga Bateria',
        sensor_load: 'Potencia Casa',
        sensor_battery_level: 'Nivel Bateria %',
        sensor_ev_power: 'Potencia EV',
        sensor_ev_battery: 'Bateria EV %',
        sensor_ev_switch: 'Switch carga EV',
        sensor_ev2_power: 'Potencia EV 2',
        sensor_ev2_battery: 'Bateria EV 2 %',
        sensor_ev2_switch: 'Switch carga EV 2',
        sensor_weather: 'Entidad clima',
        sensor_sun: 'Entidad sol',
        hint_entities: 'Menu limpio con entidades filtradas por dominio.',
        section_dynamic_bg: 'Fondo Dinamico',
        field_dynamic_bg: 'Activar dinamico',
        hint_bg_lookup: 'Prioridad: periodo+clima+cargando -> periodo+clima -> period_default -> default -> background.',
        placeholder_select: '-- seleccionar --',
        placeholder_sensor: '-- seleccionar sensor --',
        placeholder_switch: '-- seleccionar switch --',
        placeholder_weather: '-- seleccionar weather --',
        placeholder_sun: '-- seleccionar sun --',
        lang_auto: 'Automatico (Home Assistant)',
        lang_it: 'Italiano',
        lang_en: 'Ingles',
        lang_es: 'Espanol',
        lang_fr: 'Frances',
        lang_de: 'Aleman',
        position_open_button: 'Edicion visual',
        position_modal_title: 'Edicion visual',
        position_modal_kicker: 'Posiciones de escena',
        position_close_button: 'Cerrar',
        position_field_scene: 'Escena',
        position_field_label: 'Etiqueta',
        position_field_value: 'Valor',
        position_field_guide_a: 'Linea A',
        position_field_guide_b: 'Linea B',
        section_scene_positions: 'Posiciones de escena',
        position_hint: 'El porcentaje de la bateria sigue automaticamente al valor en kW. La geometria de las rutas permanece en YAML/JSON.'
      }
    },
    fr: {
      card: {
        default_title: 'Flux Energie',
        node: {
          solar: 'Solaire',
          grid: 'Reseau',
          home: 'Maison',
          battery: 'Batterie',
          ev: 'EV'
        },
        status: {
          inactive: 'INACTIF',
          connected: 'CONNECTE',
          consuming: 'CONSOMMATION',
          waiting: 'EN ATTENTE',
          off: 'OFF',
          producing: 'PRODUCTION',
          charging: 'CHARGE',
          discharging: 'DECHARGE'
        }
      },
      editor: {
        section_general: 'General',
        field_title: 'Titre',
        field_language: 'Langue',
        field_background: 'URL du fond',
        field_background_base: 'Base assets fond (auto)',
        field_grid_invert: 'Inverser signe reseau',
        field_show_labels: 'Afficher etiquettes',
        field_hide_ev_idle: 'Masquer EV si inactif',
        field_scene_scale: 'Echelle scene',
        field_solar_threshold: 'Seuil Solaire (W)',
        field_grid_threshold: 'Seuil Reseau (W)',
        field_battery_threshold: 'Seuil Batterie (W)',
        section_sensors: 'Capteurs',
        sensor_solar: 'Puissance Solaire',
        sensor_grid: 'Puissance Reseau',
        sensor_battery: 'Puissance Batterie',
        sensor_battery_charge: 'Puissance Charge Batterie',
        sensor_battery_discharge: 'Puissance Decharge Batterie',
        sensor_load: 'Puissance Maison',
        sensor_battery_level: 'Niveau Batterie %',
        sensor_ev_power: 'Puissance EV',
        sensor_ev_battery: 'Batterie EV %',
        sensor_ev_switch: 'Switch charge EV',
        sensor_ev2_power: 'Puissance EV 2',
        sensor_ev2_battery: 'Batterie EV 2 %',
        sensor_ev2_switch: 'Switch charge EV 2',
        sensor_weather: 'Entite meteo',
        sensor_sun: 'Entite soleil',
        hint_entities: 'Menu propre avec entites filtrees par domaine.',
        section_dynamic_bg: 'Fond Dynamique',
        field_dynamic_bg: 'Activer dynamique',
        hint_bg_lookup: 'Priorite: periode+meteo+charge -> periode+meteo -> period_default -> default -> background.',
        placeholder_select: '-- selectionner --',
        placeholder_sensor: '-- selectionner capteur --',
        placeholder_switch: '-- selectionner switch --',
        placeholder_weather: '-- selectionner weather --',
        placeholder_sun: '-- selectionner sun --',
        lang_auto: 'Automatique (Home Assistant)',
        lang_it: 'Italien',
        lang_en: 'Anglais',
        lang_es: 'Espagnol',
        lang_fr: 'Francais',
        lang_de: 'Allemand',
        position_open_button: 'Edition visuelle',
        position_modal_title: 'Edition visuelle',
        position_modal_kicker: 'Positions de scene',
        position_close_button: 'Fermer',
        position_field_scene: 'Scene',
        position_field_label: 'Etiquette',
        position_field_value: 'Valeur',
        position_field_guide_a: 'Repere A',
        position_field_guide_b: 'Repere B',
        section_scene_positions: 'Positions de scene',
        position_hint: 'Le pourcentage de la batterie suit automatiquement la valeur en kW. La geometrie des chemins reste en YAML/JSON.'
      }
    },
    de: {
      card: {
        default_title: 'Energiefluss',
        node: {
          solar: 'Solar',
          grid: 'Netz',
          home: 'Haus',
          battery: 'Batterie',
          ev: 'EV'
        },
        status: {
          inactive: 'INAKTIV',
          connected: 'VERBUNDEN',
          consuming: 'VERBRAUCH',
          waiting: 'BEREIT',
          off: 'OFF',
          producing: 'ERZEUGUNG',
          charging: 'LADUNG',
          discharging: 'ENTLADUNG'
        }
      },
      editor: {
        section_general: 'Allgemein',
        field_title: 'Titel',
        field_language: 'Sprache',
        field_background: 'Hintergrund URL',
        field_background_base: 'Hintergrund Asset-Basis (auto)',
        field_grid_invert: 'Netz-Vorzeichen invertieren',
        field_show_labels: 'Labels anzeigen',
        field_hide_ev_idle: 'EV ausblenden wenn nicht laedt',
        field_scene_scale: 'Szenen-Skalierung',
        field_solar_threshold: 'Solar-Schwelle (W)',
        field_grid_threshold: 'Netz-Schwelle (W)',
        field_battery_threshold: 'Batterie-Schwelle (W)',
        section_sensors: 'Sensoren',
        sensor_solar: 'Solarleistung',
        sensor_grid: 'Netzleistung',
        sensor_battery: 'Batterieleistung',
        sensor_battery_charge: 'Batterie Ladeleistung',
        sensor_battery_discharge: 'Batterie Entladeleistung',
        sensor_load: 'Hausverbrauch',
        sensor_battery_level: 'Batteriestand %',
        sensor_ev_power: 'EV Leistung',
        sensor_ev_battery: 'EV Batterie %',
        sensor_ev_switch: 'EV Lade-Switch',
        sensor_ev2_power: 'EV 2 Leistung',
        sensor_ev2_battery: 'EV 2 Batterie %',
        sensor_ev2_switch: 'EV 2 Lade-Switch',
        sensor_weather: 'Wetter-Entitat',
        sensor_sun: 'Sonnen-Entitat',
        hint_entities: 'Sauberes Menu mit nach Domain gefilterten Entitaten.',
        section_dynamic_bg: 'Dynamischer Hintergrund',
        field_dynamic_bg: 'Dynamik aktivieren',
        hint_bg_lookup: 'Prioritat: periode+wetter+laden -> periode+wetter -> period_default -> default -> background.',
        placeholder_select: '-- auswaehlen --',
        placeholder_sensor: '-- sensor auswaehlen --',
        placeholder_switch: '-- switch auswaehlen --',
        placeholder_weather: '-- weather auswaehlen --',
        placeholder_sun: '-- sun auswaehlen --',
        lang_auto: 'Automatisch (Home Assistant)',
        lang_it: 'Italienisch',
        lang_en: 'Englisch',
        lang_es: 'Spanisch',
        lang_fr: 'Franzosisch',
        lang_de: 'Deutsch',
        position_open_button: 'Visuell bearbeiten',
        position_modal_title: 'Visuell bearbeiten',
        position_modal_kicker: 'Szenenpositionen',
        position_close_button: 'Schliessen',
        position_field_scene: 'Szene',
        position_field_label: 'Beschriftung',
        position_field_value: 'Wert',
        position_field_guide_a: 'Linie A',
        position_field_guide_b: 'Linie B',
        section_scene_positions: 'Szenenpositionen',
        position_hint: 'Batterie-Prozent folgt automatisch dem Batterie-kW-Wert. Pfad-Geometrie bleibt in YAML/JSON.'
      }
    }
  });

  const LEGACY_SCENE_IMAGES = new Set(['image.png', 'image2.png']);
  const SCENE_IMAGE_MAP = Object.freeze({
    day_clear_charging: 'scene_day_clear_charging.png',
    day_clear_idle: 'scene_day_clear_idle.png',
    day_cloudy_charging: 'scene_day_clear_charging.png',
    day_cloudy_idle: 'scene_day_clear_idle.png',
    day_rain_charging: 'scene_day_rain_charging.png',
    day_rain_idle: 'scene_day_rain_idle.png',
    day_snow_charging: 'scene_day_clear_charging.png',
    day_snow_idle: 'scene_day_clear_idle.png',
    day_storm_charging: 'scene_day_clear_charging.png',
    day_storm_idle: 'scene_day_clear_idle.png',
    night_clear_charging: 'scene_night_clear_charging.png',
    night_clear_idle: 'scene_night_clear_idle.png',
    night_cloudy_charging: 'scene_night_clear_charging.png',
    night_cloudy_idle: 'scene_night_clear_idle.png',
    night_rain_charging: 'scene_night_rain_charging.png',
    night_rain_idle: 'scene_night_rain_idle.png',
    night_snow_charging: 'scene_night_clear_charging.png',
    night_snow_idle: 'scene_night_clear_idle.png',
    night_storm_charging: 'scene_night_clear_charging.png',
    night_storm_idle: 'scene_night_clear_idle.png'
  });

  const DUAL_CHARGING_SCENE_IMAGE_MAP = Object.freeze({
    day_clear_dual_charging: 'scene_day_clear_dual_charging.png',
    day_cloudy_dual_charging: 'scene_day_clear_dual_charging.png',
    day_rain_dual_charging: 'scene_day_rain_dual_charging.png',
    day_snow_dual_charging: 'scene_day_clear_dual_charging.png',
    day_storm_dual_charging: 'scene_day_clear_dual_charging.png',
    night_clear_dual_charging: 'scene_night_clear_dual_charging.png',
    night_cloudy_dual_charging: 'scene_night_clear_dual_charging.png',
    night_rain_dual_charging: 'scene_night_rain_dual_charging.png',
    night_snow_dual_charging: 'scene_night_clear_dual_charging.png',
    night_storm_dual_charging: 'scene_night_clear_dual_charging.png'
  });

  const FLOW_PATH_KEYS = Object.freeze({
    'line-solar-load': 'line_solar_load',
    'line-grid-load': 'line_grid_load',
    'line-battery-load': 'line_battery_load',
    'line-junction-home-load': 'line_junction_home_load',
    'line-wallbox-ev': 'line_wallbox_ev',
    'line-wallbox-ev2': 'line_wallbox_ev2',
    'line-solar-grid': 'line_solar_grid',
    'line-solar-battery': 'line_solar_battery',
    'line-grid-battery': 'line_grid_battery'
  });

  const DAY_CLEAR_IDLE_PATHS = Object.freeze({
      'line-solar-load': 'M 351 292 L 352 338 L 352 338',
      'line-solar-grid': 'M 350 292 L 352 378 L 436 404',
      'line-solar-battery': 'M 350 292 L 352 340 L 310 348',
      'line-grid-load': 'M 434 402 Q 434 402 351 375 Q 352 340 351 341',
      'line-grid-battery': 'M 352 338 L 310 348',
      'line-battery-load': 'M 310 348 Q 353 339 352 338',
      'line-junction-home-load': 'M 354 338 Q 386 330 408 324',
      'line-wallbox-ev': 'M 164 322 Q 160 368 182 344',
      'line-wallbox-ev2': 'M 148 312 Q 126 310 112 316'
  });

  const DAY_CLEAR_CHARGING_PATHS = Object.freeze({
      'line-solar-load': 'M 351 292 L 352 338 L 352 338',
      'line-solar-grid': 'M 350 292 L 352 374 L 434 402',
      'line-solar-battery': 'M 350 292 L 352 338 L 312 348',
      'line-grid-load': 'M 434 402 Q 434 402 351 375 Q 352 340 351 341',
      'line-grid-battery': 'M 352 340 L 312 348',
      'line-battery-load': 'M 310 348 Q 353 339 352 338',
      'line-junction-home-load': 'M 354 338 Q 386 330 408 324',
      'line-wallbox-ev': 'M 164 322 Q 160 368 182 344',
      'line-wallbox-ev2': 'M 148 312 Q 126 310 112 316'
  });

  const DAY_CLEAR_DUAL_CHARGING_PATHS = Object.freeze({
      'line-solar-load': 'M 394 287 L 401 302 401 337',
      'line-solar-grid': 'M 401 341 L 400 378 476 402',
      'line-solar-battery': 'M 400 337 L 389 341 354 348',
      'line-grid-load': 'M 490 407 Q 441 391 399 376 400 358 400 337',
      'line-grid-battery': 'M 352 340 L 312 348',
      'line-battery-load': 'M 355 347 Q 383 342 398 338',
      'line-junction-home-load': 'M 401 338 Q 428 332 456 325',
      'line-wallbox-ev': 'M 203 323 Q 200 381 220 340',
      'line-wallbox-ev2': 'M 174 310 Q 161 384 126 315'
  });

  const SCENE_FLOW_PATH_MAP = Object.freeze({
    'scene_day_clear_idle.png': DAY_CLEAR_IDLE_PATHS,
    'scene_day_clear_charging.png': DAY_CLEAR_CHARGING_PATHS,
    'scene_day_clear_dual_charging.png': DAY_CLEAR_DUAL_CHARGING_PATHS,
    'image2.png': DAY_CLEAR_IDLE_PATHS,
    'image.png': DAY_CLEAR_CHARGING_PATHS,
    'scene_day_rain_idle.png': Object.freeze({
      'line-solar-load': 'M 351 292 L 352 338 L 352 338',
      'line-solar-grid': 'M 350 288 L 352 376 L 436 402',
      'line-solar-battery': 'M 350 288 L 352 332 L 310 342',
      'line-grid-load': 'M 434 402 Q 434 402 351 375 Q 352 340 351 341',
      'line-grid-battery': 'M 436 402 L 354 374',
      'line-battery-load': 'M 310 342 Q 352 334 352 330',
      'line-junction-home-load': 'M 350 332 Q 386 326 410 318',
      'line-wallbox-ev': 'M 164 314 Q 160 368 182 344',
      'line-wallbox-ev2': 'M 148 304 Q 126 302 112 308'
    }),
    'scene_day_rain_charging.png': Object.freeze({
      'line-solar-load': 'M 380 272 L 382 316 L 436 304',
      'line-solar-grid': 'M 380 272 L 382 354 L 468 378',
      'line-solar-battery': 'M 380 276 L 382 314 L 334 324',
      'line-grid-load': 'M 464 378 Q 464 376 382 354 Q 382 336 382 314',
      'line-grid-battery': 'M 468 378 L 384 354',
      'line-battery-load': 'M 336 324 Q 368 318 382 314',
      'line-junction-home-load': 'M 382 314 Q 410 308 438 302',
      'line-wallbox-ev': 'M 174 296 Q 164 342 188 314',
      'line-wallbox-ev2': 'M 164 286 Q 134 280 106 292'
    }),
    'scene_day_rain_dual_charging.png': Object.freeze({
      'line-solar-load': 'M 398 291 L 400 305 400 337',
      'line-solar-grid': 'M 400 336 L 399 378 497 411',
      'line-solar-battery': 'M 401 337 L 385 341 356 347',
      'line-grid-load': 'M 532 420 Q 471 402 398 377 399 354 400 334',
      'line-grid-battery': 'M 457 396 L 401 377',
      'line-battery-load': 'M 354 348 Q 380 342 401 338',
      'line-junction-home-load': 'M 400 337 Q 427 331 458 324',
      'line-wallbox-ev': 'M 204 322 Q 202 376 216 345',
      'line-wallbox-ev2': 'M 171 310 Q 170 378 128 322'
    }),
    'scene_night_clear_idle.png': Object.freeze({
      'line-solar-load': 'M 351 292 L 352 338 L 352 338',
      'line-solar-grid': 'M 352 296 L 352 376 L 440 406',
      'line-solar-battery': 'M 350 292 L 350 338 L 312 346',
      'line-grid-load': 'M 434 402 Q 434 402 351 375 Q 352 340 351 341',
      'line-grid-battery': 'M 438 404 L 354 376',
      'line-battery-load': 'M 310 348 Q 353 339 352 338',
      'line-junction-home-load': 'M 354 338 Q 386 330 408 324',
      'line-wallbox-ev': 'M 164 322 Q 160 368 182 344',
      'line-wallbox-ev2': 'M 150 314 Q 128 312 112 318'
    }),
    'scene_night_clear_charging.png': Object.freeze({
      'line-solar-load': 'M 376 278 L 382 322 L 432 312',
      'line-solar-grid': 'M 378 282 L 382 360 L 480 392',
      'line-solar-battery': 'M 378 280 L 380 324 L 332 330',
      'line-grid-load': 'M 478 390 Q 454 384 382 360 Q 382 334 382 326',
      'line-grid-battery': 'M 482 394 L 384 360',
      'line-battery-load': 'M 336 330 Q 380 324 382 322',
      'line-junction-home-load': 'M 382 322 Q 416 316 434 310',
      'line-wallbox-ev': 'M 192 304 Q 184 352 206 326',
      'line-wallbox-ev2': 'M 180 294 Q 148 286 118 300'
    }),
    'scene_night_clear_dual_charging.png': Object.freeze({
      'line-solar-load': 'M 397 289 L 401 305 401 336',
      'line-solar-grid': 'M 400 337 L 400 378 480 401',
      'line-solar-battery': 'M 402 336 L 380 341 355 347',
      'line-grid-load': 'M 511 413 Q 454 397 401 378 400 356 399 337',
      'line-grid-battery': 'M 501 409 L 402 378',
      'line-battery-load': 'M 353 346 Q 383 340 400 336',
      'line-junction-home-load': 'M 402 336 Q 435 329 458 323',
      'line-wallbox-ev': 'M 204 321 Q 199 376 221 341',
      'line-wallbox-ev2': 'M 174 310 Q 154 390 127 317'
    }),
    'scene_night_rain_idle.png': Object.freeze({
      'line-solar-load': 'M 351 292 L 352 338 L 352 338',
      'line-solar-grid': 'M 350 284 L 354 366 L 432 392',
      'line-solar-battery': 'M 350 286 L 350 324 L 314 330',
      'line-grid-load': 'M 430 392 Q 432 394 356 366 Q 354 340 352 322',
      'line-grid-battery': 'M 434 392 L 356 366',
      'line-battery-load': 'M 310 330 Q 354 322 354 322',
      'line-junction-home-load': 'M 352 324 Q 388 316 406 312',
      'line-wallbox-ev': 'M 166 310 Q 160 354 184 334',
      'line-wallbox-ev2': 'M 150 300 Q 126 296 110 306'
    }),
    'scene_night_rain_charging.png': Object.freeze({
      'line-solar-load': 'M 351 292 L 352 338 L 352 338',
      'line-solar-grid': 'M 350 290 L 350 376 L 434 402',
      'line-solar-battery': 'M 350 290 L 352 334 L 310 342',
      'line-grid-load': 'M 434 402 Q 434 402 351 375 Q 352 340 351 341',
      'line-grid-battery': 'M 436 402 L 352 376',
      'line-battery-load': 'M 310 348 Q 353 339 352 338',
      'line-junction-home-load': 'M 352 334 Q 386 326 410 320',
      'line-wallbox-ev': 'M 164 314 Q 160 356 182 332',
      'line-wallbox-ev2': 'M 150 304 Q 128 300 112 308'
    }),
    'scene_night_rain_dual_charging.png': Object.freeze({
      'line-solar-load': 'M 396 287 L 398 300 398 338',
      'line-solar-grid': 'M 399 340 L 398 376 470 400',
      'line-solar-battery': 'M 399 336 L 400 338 357 347',
      'line-grid-load': 'M 504 409 Q 452 391 398 376 399 357 400 338',
      'line-grid-battery': 'M 436 402 L 352 376',
      'line-battery-load': 'M 355 347 Q 382 342 401 337',
      'line-junction-home-load': 'M 401 336 Q 431 329 458 323',
      'line-wallbox-ev': 'M 204 322 Q 199 380 223 338',
      'line-wallbox-ev2': 'M 173 310 Q 156 388 129 317'
    })
  });

  const DAY_CLEAR_IDLE_COMPONENTS = Object.freeze({
    'solar-label': Object.freeze({ x: -20, y: -94 }),
    'solar-power': Object.freeze({ x: -20, y: -72 }),
    'solar-guide': Object.freeze({ x1: -20, y1: -56, x2: -20, y2: 16 }),
    'grid-label': Object.freeze({ x: 4, y: -14 }),
    'grid-power': Object.freeze({ x: 4, y: 8 }),
    'grid-guide': Object.freeze({ x1: 4, y1: 26, x2: 4, y2: 64 }),
    'load-label': Object.freeze({ x: -32, y: -64 }),
    'load-power': Object.freeze({ x: -32, y: -42 }),
    'load-guide': Object.freeze({ x1: -32, y1: -6, x2: -32, y2: 68 }),
    'battery-label': Object.freeze({ x: -30, y: 82 }),
    'battery-power': Object.freeze({ x: -6, y: 104 }),
    'battery-arrow': Object.freeze({ x: 2, y: 104 }),
    'battery-pct': Object.freeze({ x: 10, y: 104 }),
    'battery-status': Object.freeze({ x: 30, y: 98 }),
    'battery-guide': Object.freeze({ x1: -38, y1: 42, x2: -38, y2: 70 }),
    'ev-label': Object.freeze({ x: -20, y: -138 }),
    'ev-power': Object.freeze({ x: -4, y: -110 }),
    'ev-pct': Object.freeze({ x: -6, y: 6 }),
    'ev-guide': Object.freeze({ x1: -22, y1: -100, x2: -22, y2: -30 }),
    'ev2-label': Object.freeze({ x: -8, y: -42 }),
    'ev2-power': Object.freeze({ x: 10, y: -20 }),
    'ev2-pct': Object.freeze({ x: 10, y: -2 }),
    'ev2-guide': Object.freeze({ x1: -10, y1: -30, x2: -10, y2: 0 })
  });

  const DAY_CLEAR_CHARGING_COMPONENTS = Object.freeze({
    'solar-label': Object.freeze({ x: 4, y: -76 }),
    'solar-power': Object.freeze({ x: 18, y: -52 }),
    'solar-guide': Object.freeze({ x1: 0, y1: -50, x2: 0, y2: 30 }),
    'grid-label': Object.freeze({ x: 8, y: 94 }),
    'grid-power': Object.freeze({ x: 28, y: 116 }),
    'grid-guide': Object.freeze({ x1: 6, y1: 36, x2: 6, y2: 80 }),
    'load-label': Object.freeze({ x: -32, y: -20 }),
    'load-power': Object.freeze({ x: -12, y: 2 }),
    'load-guide': Object.freeze({ x1: -32, y1: 2, x2: -32, y2: 66 }),
    'battery-label': Object.freeze({ x: -46, y: 100 }),
    'battery-power': Object.freeze({ x: -34, y: 122 }),
    'battery-pct': Object.freeze({ x: -14, y: 84 }),
    'battery-status': Object.freeze({ x: 12, y: 100 }),
    'battery-guide': Object.freeze({ x1: -44, y1: 52, x2: -44, y2: 80 }),
    'ev-label': Object.freeze({ x: 2, y: -118 }),
    'ev-power': Object.freeze({ x: 20, y: -100 }),
    'ev-pct': Object.freeze({ x: 2, y: -14 }),
    'ev-guide': Object.freeze({ x1: 0, y1: -98, x2: 0, y2: 4 }),
    'ev2-label': Object.freeze({ x: -18, y: -84 }),
    'ev2-power': Object.freeze({ x: 0, y: -60 }),
    'ev2-pct': Object.freeze({ x: 0, y: -42 }),
    'ev2-guide': Object.freeze({ x1: -16, y1: -70, x2: -16, y2: -12 })
  });

  const DAY_CLEAR_DUAL_CHARGING_COMPONENTS = Object.freeze({
    'solar-label': Object.freeze({ x: 9, y: -77 }),
    'solar-power': Object.freeze({ x: 10, y: -59 }),
    'solar-guide': Object.freeze({ x1: 0, y1: -50, x2: 0, y2: 30 }),
    'grid-label': Object.freeze({ x: 25, y: 100 }),
    'grid-power': Object.freeze({ x: 28, y: 116 }),
    'grid-guide': Object.freeze({ x1: 22, y1: 44, x2: 22, y2: 88 }),
    'load-label': Object.freeze({ x: 24, y: -14 }),
    'load-power': Object.freeze({ x: 28, y: 3 }),
    'load-guide': Object.freeze({ x1: 17, y1: 8, x2: 17, y2: 72 }),
    'battery-label': Object.freeze({ x: 15, y: 102 }),
    'battery-power': Object.freeze({ x: 14, y: 117 }),
    'battery-pct': Object.freeze({ x: 28, y: 83 }),
    'battery-status': Object.freeze({ x: 12, y: 100 }),
    'battery-guide': Object.freeze({ x1: 10, y1: 60, x2: 10, y2: 88 }),
    'ev-label': Object.freeze({ x: 14, y: -102 }),
    'ev-power': Object.freeze({ x: 22, y: -84 }),
    'ev-pct': Object.freeze({ x: 41, y: -5 }),
    'ev-guide': Object.freeze({ x1: 0, y1: -98, x2: 0, y2: 4 }),
    'ev2-label': Object.freeze({ x: -46, y: -101 }),
    'ev2-power': Object.freeze({ x: -41, y: -85 }),
    'ev2-pct': Object.freeze({ x: -30, y: -42 }),
    'ev2-guide': Object.freeze({ x1: -47, y1: -75, x2: -47, y2: -17 })
  });

  const SCENE_FLOW_COMPONENT_MAP = Object.freeze({
    'scene_day_clear_idle.png': DAY_CLEAR_IDLE_COMPONENTS,
    'scene_day_clear_charging.png': DAY_CLEAR_CHARGING_COMPONENTS,
    'scene_day_clear_dual_charging.png': DAY_CLEAR_DUAL_CHARGING_COMPONENTS,
    'image2.png': DAY_CLEAR_IDLE_COMPONENTS,
    'image.png': DAY_CLEAR_CHARGING_COMPONENTS,
    'scene_day_rain_idle.png': Object.freeze({
      'solar-label': Object.freeze({ x: -16, y: -112 }),
      'solar-power': Object.freeze({ x: 0, y: -86 }),
      'solar-guide': Object.freeze({ x1: -18, y1: -82, x2: -18, y2: -2 }),
      'grid-label': Object.freeze({ x: 24, y: 80 }),
      'grid-power': Object.freeze({ x: 42, y: 106 }),
      'grid-guide': Object.freeze({ x1: 22, y1: 32, x2: 22, y2: 62 }),
      'load-label': Object.freeze({ x: -36, y: -38 }),
      'load-power': Object.freeze({ x: -14, y: -12 }),
      'load-guide': Object.freeze({ x1: -32, y1: -8, x2: -32, y2: 64 }),
      'battery-label': Object.freeze({ x: -22, y: 88 }),
      'battery-power': Object.freeze({ x: -10, y: 112 }),
      'battery-pct': Object.freeze({ x: -12, y: 74 }),
      'battery-status': Object.freeze({ x: 36, y: 88 }),
      'battery-guide': Object.freeze({ x1: 0, y1: 12, x2: 0, y2: 42 }),
      'ev-label': Object.freeze({ x: -26, y: -132 }),
      'ev-power': Object.freeze({ x: -6, y: -106 }),
      'ev-pct': Object.freeze({ x: -6, y: -90 }),
      'ev-guide': Object.freeze({ x1: -26, y1: -94, x2: -26, y2: -22 }),
      'ev2-label': Object.freeze({ x: -14, y: -84 }),
      'ev2-power': Object.freeze({ x: 2, y: -62 }),
      'ev2-pct': Object.freeze({ x: 0, y: -44 }),
      'ev2-guide': Object.freeze({ x1: -16, y1: -72, x2: -16, y2: -18 })
    }),
    'scene_day_rain_charging.png': Object.freeze({
      'solar-label': Object.freeze({ x: 14, y: -106 }),
      'solar-power': Object.freeze({ x: 20, y: -86 }),
      'solar-guide': Object.freeze({ x1: 0, y1: -84, x2: 0, y2: -4 }),
      'grid-label': Object.freeze({ x: 6, y: 78 }),
      'grid-power': Object.freeze({ x: 24, y: 98 }),
      'grid-guide': Object.freeze({ x1: 6, y1: 32, x2: 6, y2: 62 }),
      'load-label': Object.freeze({ x: 0, y: -58 }),
      'load-power': Object.freeze({ x: 18, y: -34 }),
      'load-guide': Object.freeze({ x1: 0, y1: -26, x2: 0, y2: 46 }),
      'battery-label': Object.freeze({ x: -20, y: 82 }),
      'battery-power': Object.freeze({ x: -6, y: 106 }),
      'battery-pct': Object.freeze({ x: 4, y: 36 }),
      'battery-status': Object.freeze({ x: 40, y: 82 }),
      'battery-guide': Object.freeze({ x1: -12, y1: 28, x2: -12, y2: 70 }),
      'ev-label': Object.freeze({ x: -16, y: -142 }),
      'ev-power': Object.freeze({ x: 0, y: -118 }),
      'ev-pct': Object.freeze({ x: 14, y: -46 }),
      'ev-guide': Object.freeze({ x1: -18, y1: -114, x2: -20, y2: -24 }),
      'ev2-label': Object.freeze({ x: -22, y: -92 }),
      'ev2-power': Object.freeze({ x: -4, y: -68 }),
      'ev2-pct': Object.freeze({ x: 0, y: -48 }),
      'ev2-guide': Object.freeze({ x1: -20, y1: -78, x2: -22, y2: -24 })
    }),
    'scene_day_rain_dual_charging.png': Object.freeze({
      'solar-label': Object.freeze({ x: 14, y: -106 }),
      'solar-power': Object.freeze({ x: 20, y: -86 }),
      'solar-guide': Object.freeze({ x1: 0, y1: -84, x2: 0, y2: -4 }),
      'grid-label': Object.freeze({ x: 6, y: 78 }),
      'grid-power': Object.freeze({ x: 24, y: 98 }),
      'grid-guide': Object.freeze({ x1: 6, y1: 32, x2: 6, y2: 62 }),
      'load-label': Object.freeze({ x: 0, y: -58 }),
      'load-power': Object.freeze({ x: 18, y: -34 }),
      'load-guide': Object.freeze({ x1: 0, y1: -26, x2: 0, y2: 46 }),
      'battery-label': Object.freeze({ x: -14, y: 93 }),
      'battery-power': Object.freeze({ x: -12, y: 113 }),
      'battery-pct': Object.freeze({ x: 13, y: 64 }),
      'battery-status': Object.freeze({ x: 40, y: 82 }),
      'battery-guide': Object.freeze({ x1: -12, y1: 37, x2: -12, y2: 79 }),
      'ev-label': Object.freeze({ x: -7, y: -132 }),
      'ev-power': Object.freeze({ x: 0, y: -118 }),
      'ev-pct': Object.freeze({ x: 14, y: -46 }),
      'ev-guide': Object.freeze({ x1: -18, y1: -114, x2: -20, y2: -24 }),
      'ev2-label': Object.freeze({ x: -22, y: -92 }),
      'ev2-power': Object.freeze({ x: -4, y: -68 }),
      'ev2-pct': Object.freeze({ x: 0, y: -48 }),
      'ev2-guide': Object.freeze({ x1: -20, y1: -78, x2: -22, y2: -24 })
    }),
    'scene_night_clear_idle.png': Object.freeze({
      'solar-label': Object.freeze({ x: 4, y: -110 }),
      'solar-power': Object.freeze({ x: 20, y: -86 }),
      'solar-guide': Object.freeze({ x1: 0, y1: -92, x2: 0, y2: -12 }),
      'grid-label': Object.freeze({ x: 18, y: -14 }),
      'grid-power': Object.freeze({ x: 18, y: 8 }),
      'grid-guide': Object.freeze({ x1: 18, y1: 30, x2: 18, y2: 60 }),
      'load-label': Object.freeze({ x: -36, y: -28 }),
      'load-power': Object.freeze({ x: -16, y: -2 }),
      'load-guide': Object.freeze({ x1: -34, y1: 4, x2: -34, y2: 76 }),
      'battery-label': Object.freeze({ x: -34, y: 96 }),
      'battery-power': Object.freeze({ x: -18, y: 122 }),
      'battery-pct': Object.freeze({ x: -12, y: 80 }),
      'battery-status': Object.freeze({ x: 28, y: 96 }),
      'battery-guide': Object.freeze({ x1: -38, y1: 54, x2: -38, y2: 84 }),
      'ev-label': Object.freeze({ x: -22, y: -110 }),
      'ev-power': Object.freeze({ x: -6, y: -82 }),
      'ev-pct': Object.freeze({ x: 2, y: -24 }),
      'ev-guide': Object.freeze({ x1: -18, y1: -72, x2: -18, y2: -6 }),
      'ev2-label': Object.freeze({ x: -14, y: -76 }),
      'ev2-power': Object.freeze({ x: 2, y: -54 }),
      'ev2-pct': Object.freeze({ x: 4, y: -34 }),
      'ev2-guide': Object.freeze({ x1: -12, y1: -60, x2: -12, y2: -12 })
    }),
    'scene_night_clear_charging.png': Object.freeze({
      'solar-label': Object.freeze({ x: 4, y: -114 }),
      'solar-power': Object.freeze({ x: 18, y: -88 }),
      'solar-guide': Object.freeze({ x1: 0, y1: -92, x2: 0, y2: -12 }),
      'grid-label': Object.freeze({ x: 36, y: 74 }),
      'grid-power': Object.freeze({ x: 54, y: 100 }),
      'grid-guide': Object.freeze({ x1: 34, y1: 30, x2: 34, y2: 60 }),
      'load-label': Object.freeze({ x: -10, y: -40 }),
      'load-power': Object.freeze({ x: 10, y: -16 }),
      'load-guide': Object.freeze({ x1: -8, y1: -8, x2: -8, y2: 64 }),
      'battery-label': Object.freeze({ x: -6, y: 96 }),
      'battery-power': Object.freeze({ x: 8, y: 118 }),
      'battery-pct': Object.freeze({ x: 18, y: 70 }),
      'battery-status': Object.freeze({ x: 54, y: 96 }),
      'battery-guide': Object.freeze({ x1: -8, y1: 44, x2: -8, y2: 74 }),
      'ev-label': Object.freeze({ x: 10, y: -110 }),
      'ev-power': Object.freeze({ x: 26, y: -86 }),
      'ev-pct': Object.freeze({ x: 32, y: -34 }),
      'ev-guide': Object.freeze({ x1: 8, y1: -78, x2: 10, y2: -30 }),
      'ev2-label': Object.freeze({ x: -10, y: -78 }),
      'ev2-power': Object.freeze({ x: 6, y: -56 }),
      'ev2-pct': Object.freeze({ x: 8, y: -36 }),
      'ev2-guide': Object.freeze({ x1: -8, y1: -64, x2: -10, y2: -22 })
    }),
    'scene_night_clear_dual_charging.png': Object.freeze({
      'solar-label': Object.freeze({ x: 4, y: -114 }),
      'solar-power': Object.freeze({ x: 18, y: -88 }),
      'solar-guide': Object.freeze({ x1: 0, y1: -92, x2: 0, y2: -12 }),
      'grid-label': Object.freeze({ x: 23, y: 98 }),
      'grid-power': Object.freeze({ x: 29, y: 115 }),
      'grid-guide': Object.freeze({ x1: 24, y1: 60, x2: 24, y2: 90 }),
      'load-label': Object.freeze({ x: -10, y: -40 }),
      'load-power': Object.freeze({ x: 10, y: -16 }),
      'load-guide': Object.freeze({ x1: -8, y1: -8, x2: -8, y2: 64 }),
      'battery-label': Object.freeze({ x: -6, y: 96 }),
      'battery-power': Object.freeze({ x: 8, y: 118 }),
      'battery-pct': Object.freeze({ x: 18, y: 70 }),
      'battery-status': Object.freeze({ x: 54, y: 96 }),
      'battery-guide': Object.freeze({ x1: -8, y1: 44, x2: -8, y2: 74 }),
      'ev-label': Object.freeze({ x: 10, y: -110 }),
      'ev-power': Object.freeze({ x: 26, y: -86 }),
      'ev-pct': Object.freeze({ x: 32, y: -34 }),
      'ev-guide': Object.freeze({ x1: 8, y1: -78, x2: 10, y2: -30 }),
      'ev2-label': Object.freeze({ x: -10, y: -78 }),
      'ev2-power': Object.freeze({ x: 6, y: -56 }),
      'ev2-pct': Object.freeze({ x: 8, y: -36 }),
      'ev2-guide': Object.freeze({ x1: -8, y1: -64, x2: -10, y2: -22 })
    }),
    'scene_night_rain_idle.png': Object.freeze({
      'solar-label': Object.freeze({ x: 2, y: -100 }),
      'solar-power': Object.freeze({ x: 20, y: -80 }),
      'solar-guide': Object.freeze({ x1: 0, y1: -80, x2: 0, y2: 0 }),
      'grid-label': Object.freeze({ x: 0, y: 76 }),
      'grid-power': Object.freeze({ x: 20, y: 102 }),
      'grid-guide': Object.freeze({ x1: 0, y1: 34, x2: 0, y2: 64 }),
      'load-label': Object.freeze({ x: -34, y: -42 }),
      'load-power': Object.freeze({ x: -14, y: -18 }),
      'load-guide': Object.freeze({ x1: -34, y1: -12, x2: -34, y2: 60 }),
      'battery-label': Object.freeze({ x: -36, y: 98 }),
      'battery-power': Object.freeze({ x: -20, y: 120 }),
      'battery-pct': Object.freeze({ x: -12, y: 70 }),
      'battery-status': Object.freeze({ x: 24, y: 98 }),
      'battery-guide': Object.freeze({ x1: -38, y1: 48, x2: -38, y2: 78 }),
      'ev-label': Object.freeze({ x: -12, y: -108 }),
      'ev-power': Object.freeze({ x: 2, y: -84 }),
      'ev-pct': Object.freeze({ x: 2, y: -32 }),
      'ev-guide': Object.freeze({ x1: -20, y1: -78, x2: -20, y2: -48 }),
      'ev2-label': Object.freeze({ x: -14, y: -76 }),
      'ev2-power': Object.freeze({ x: 4, y: -54 }),
      'ev2-pct': Object.freeze({ x: 6, y: -36 }),
      'ev2-guide': Object.freeze({ x1: -14, y1: -60, x2: -14, y2: -24 })
    }),
    'scene_night_rain_charging.png': Object.freeze({
      'solar-label': Object.freeze({ x: -22, y: -104 }),
      'solar-power': Object.freeze({ x: -2, y: -82 }),
      'solar-guide': Object.freeze({ x1: -22, y1: -78, x2: -22, y2: 2 }),
      'grid-label': Object.freeze({ x: 10, y: 90 }),
      'grid-power': Object.freeze({ x: 28, y: 112 }),
      'grid-guide': Object.freeze({ x1: 8, y1: 42, x2: 8, y2: 72 }),
      'load-label': Object.freeze({ x: -36, y: -30 }),
      'load-power': Object.freeze({ x: -16, y: -8 }),
      'load-guide': Object.freeze({ x1: -34, y1: -2, x2: -34, y2: 70 }),
      'battery-label': Object.freeze({ x: -18, y: 92 }),
      'battery-power': Object.freeze({ x: -8, y: 114 }),
      'battery-pct': Object.freeze({ x: -10, y: 74 }),
      'battery-status': Object.freeze({ x: 42, y: 92 }),
      'battery-guide': Object.freeze({ x1: -30, y1: 52, x2: -30, y2: 82 }),
      'ev-label': Object.freeze({ x: -18, y: -110 }),
      'ev-power': Object.freeze({ x: -2, y: -88 }),
      'ev-pct': Object.freeze({ x: 2, y: -28 }),
      'ev-guide': Object.freeze({ x1: -22, y1: -82, x2: -22, y2: -40 }),
      'ev2-label': Object.freeze({ x: -16, y: -80 }),
      'ev2-power': Object.freeze({ x: 2, y: -58 }),
      'ev2-pct': Object.freeze({ x: 4, y: -38 }),
      'ev2-guide': Object.freeze({ x1: -18, y1: -68, x2: -18, y2: -28 })
    }),
    'scene_night_rain_dual_charging.png': Object.freeze({
      'solar-label': Object.freeze({ x: -16, y: -99 }),
      'solar-power': Object.freeze({ x: -14, y: -82 }),
      'solar-guide': Object.freeze({ x1: -22, y1: -78, x2: -22, y2: 2 }),
      'grid-label': Object.freeze({ x: 0, y: 98 }),
      'grid-power': Object.freeze({ x: 6, y: 114 }),
      'grid-guide': Object.freeze({ x1: -15, y1: 58, x2: -15, y2: 88 }),
      'load-label': Object.freeze({ x: 22, y: -19 }),
      'load-power': Object.freeze({ x: 29, y: -4 }),
      'load-guide': Object.freeze({ x1: 18, y1: 1, x2: 18, y2: 73 }),
      'battery-label': Object.freeze({ x: 2, y: 106 }),
      'battery-power': Object.freeze({ x: -1, y: 121 }),
      'battery-pct': Object.freeze({ x: 46, y: 77 }),
      'battery-status': Object.freeze({ x: 42, y: 92 }),
      'battery-guide': Object.freeze({ x1: 2, y1: 62, x2: 2, y2: 92 }),
      'ev-label': Object.freeze({ x: 17, y: -93 }),
      'ev-power': Object.freeze({ x: 22, y: -75 }),
      'ev-pct': Object.freeze({ x: 44, y: -15 }),
      'ev-guide': Object.freeze({ x1: 13, y1: -68, x2: 13, y2: -26 }),
      'ev2-label': Object.freeze({ x: -13, y: -90 }),
      'ev2-power': Object.freeze({ x: -8, y: -72 }),
      'ev2-pct': Object.freeze({ x: 21, y: -28 }),
      'ev2-guide': Object.freeze({ x1: -18, y1: -68, x2: -18, y2: -28 })
    })
  });

  const POSITION_EDITOR_SCENES = Object.freeze(
    Object.keys(SCENE_FLOW_COMPONENT_MAP)
      .filter((key) => key.startsWith('scene_'))
      .map((key) => Object.freeze({
        key,
        label: key.replace(/^scene_/, '').replace(/\.png$/, '').replace(/_/g, ' ')
      }))
  );

  const POSITION_EDITOR_GROUPS = Object.freeze([
    Object.freeze({ title: 'Solar', node: 'solar', label: 'solar-label', power: 'solar-power', guide: 'solar-guide' }),
    Object.freeze({ title: 'Grid', node: 'grid', label: 'grid-label', power: 'grid-power', guide: 'grid-guide' }),
    Object.freeze({ title: 'Home', node: 'load', label: 'load-label', power: 'load-power', guide: 'load-guide' }),
    Object.freeze({ title: 'Battery', node: 'battery', label: 'battery-label', power: 'battery-power', guide: 'battery-guide' }),
    Object.freeze({ title: 'EV 1', node: 'ev', label: 'ev-label', power: 'ev-power', guide: 'ev-guide', scene: 'charging' }),
    Object.freeze({ title: 'EV 2', node: 'ev2', label: 'ev2-label', power: 'ev2-power', guide: 'ev2-guide', scene: 'dual_charging' })
  ]);

  const POSITION_EDITOR_GROUP_I18N_KEYS = Object.freeze({
    solar: 'card.node.solar',
    grid: 'card.node.grid',
    load: 'card.node.home',
    battery: 'card.node.battery',
    ev: 'card.node.ev',
    ev2: 'card.node.ev'
  });

  const POSITION_EDITOR_NODE_ORIGINS = Object.freeze({
    solar: Object.freeze({ x: 286, y: 155 }),
    grid: Object.freeze({ x: 448, y: 336 }),
    load: Object.freeze({ x: 465, y: 247 }),
    battery: Object.freeze({ x: 314, y: 330 }),
    ev: Object.freeze({ x: 184, y: 332 }),
    ev2: Object.freeze({ x: 106, y: 316 })
  });

  const FLOW_COMPONENT_BINDINGS = Object.freeze({
    'solar-label': Object.freeze({ id: 'flow-solar-label', attrs: Object.freeze(['x', 'y']) }),
    'solar-power': Object.freeze({ id: 'flow-solar-power', attrs: Object.freeze(['x', 'y']) }),
    'solar-guide': Object.freeze({ id: 'flow-solar-guide', attrs: Object.freeze(['x1', 'y1', 'x2', 'y2']) }),
    'grid-label': Object.freeze({ id: 'flow-grid-label', attrs: Object.freeze(['x', 'y']) }),
    'grid-power': Object.freeze({ id: 'flow-grid-power', attrs: Object.freeze(['x', 'y']) }),
    'grid-guide': Object.freeze({ id: 'flow-grid-guide', attrs: Object.freeze(['x1', 'y1', 'x2', 'y2']) }),
    'load-label': Object.freeze({ id: 'flow-load-label', attrs: Object.freeze(['x', 'y']) }),
    'load-power': Object.freeze({ id: 'flow-load-power', attrs: Object.freeze(['x', 'y']) }),
    'load-guide': Object.freeze({ id: 'flow-load-guide', attrs: Object.freeze(['x1', 'y1', 'x2', 'y2']) }),
    'battery-label': Object.freeze({ id: 'flow-battery-label', attrs: Object.freeze(['x', 'y']) }),
    'battery-power': Object.freeze({ id: 'flow-battery-power', attrs: Object.freeze(['x', 'y']) }),
    'battery-arrow': Object.freeze({ id: 'flow-battery-arrow', attrs: Object.freeze(['x', 'y']) }),
    'battery-pct': Object.freeze({ id: 'flow-battery-pct', attrs: Object.freeze(['x', 'y']) }),
    'battery-status': Object.freeze({ id: 'flow-battery-status', attrs: Object.freeze(['x', 'y']) }),
    'battery-guide': Object.freeze({ id: 'flow-battery-guide', attrs: Object.freeze(['x1', 'y1', 'x2', 'y2']) }),
    'ev-label': Object.freeze({ id: 'flow-ev-label', attrs: Object.freeze(['x', 'y']) }),
    'ev-power': Object.freeze({ id: 'flow-ev-power', attrs: Object.freeze(['x', 'y']) }),
    'ev-arrow': Object.freeze({ id: 'flow-ev-arrow', attrs: Object.freeze(['x', 'y']) }),
    'ev-pct': Object.freeze({ id: 'flow-ev-pct', attrs: Object.freeze(['x', 'y']) }),
    'ev-guide': Object.freeze({ id: 'flow-ev-guide', attrs: Object.freeze(['x1', 'y1', 'x2', 'y2']) }),
    'ev2-label': Object.freeze({ id: 'flow-ev2-label', attrs: Object.freeze(['x', 'y']) }),
    'ev2-power': Object.freeze({ id: 'flow-ev2-power', attrs: Object.freeze(['x', 'y']) }),
    'ev2-arrow': Object.freeze({ id: 'flow-ev2-arrow', attrs: Object.freeze(['x', 'y']) }),
    'ev2-pct': Object.freeze({ id: 'flow-ev2-pct', attrs: Object.freeze(['x', 'y']) }),
    'ev2-guide': Object.freeze({ id: 'flow-ev2-guide', attrs: Object.freeze(['x1', 'y1', 'x2', 'y2']) }),
    'roof-a-label': Object.freeze({ id: 'flow-roof-a-label', attrs: Object.freeze(['x', 'y']) }),
    'roof-a-power': Object.freeze({ id: 'flow-roof-a-power', attrs: Object.freeze(['x', 'y']) }),
    'roof-a-voltage': Object.freeze({ id: 'flow-roof-a-voltage', attrs: Object.freeze(['x', 'y']) }),
    'roof-a-current': Object.freeze({ id: 'flow-roof-a-current', attrs: Object.freeze(['x', 'y']) }),
    'roof-b-label': Object.freeze({ id: 'flow-roof-b-label', attrs: Object.freeze(['x', 'y']) }),
    'roof-b-power': Object.freeze({ id: 'flow-roof-b-power', attrs: Object.freeze(['x', 'y']) }),
    'roof-b-voltage': Object.freeze({ id: 'flow-roof-b-voltage', attrs: Object.freeze(['x', 'y']) }),
    'roof-b-current': Object.freeze({ id: 'flow-roof-b-current', attrs: Object.freeze(['x', 'y']) })
  });

  const DEFAULT_CONFIG = Object.freeze({
    type: `custom:${CARD_TYPE}`,
    title: 'Tesla Style Energy Flow',
    language: 'auto',
    background: '/local/community/tesla-style-energy-flow/backgrounds/scene_day_clear_idle.png',
    dynamic_background: true,
    background_asset_base: '/local/community/tesla-style-energy-flow/backgrounds',
    show_header: true,
    show_labels: true,
    power_unit_mode: 'auto',
    font_scale: 1,
    ev_hide_when_idle: false,
    scene_scale: 1,
    grid_invert: false,
    battery_invert: false,
    ev_label: '',
    ev2_label: '',
    roof_a_label: 'ARRAY A',
    roof_b_label: 'ARRAY B',
    ev_min_w: 150,
    thresholds: {
      solar_min_w: 50,
      grid_min_w: 50,
      battery_min_w: 50
    },
    entities: {
      solar_power: '',
      roof_a_power: '',
      roof_a_voltage: '',
      roof_a_current: '',
      roof_b_power: '',
      roof_b_voltage: '',
      roof_b_current: '',
      grid_power: '',
      battery_power: '',
      battery_charge_power: '',
      battery_discharge_power: '',
      load_power: '',
      battery_level: '',
      ev_power: '',
      ev_battery: '',
      ev_charge_switch: '',
      ev_presence: '',
      ev2_power: '',
      ev2_battery: '',
      ev2_charge_switch: '',
      ev2_presence: '',
      weather: '',
      sun: 'sun.sun'
    },
    background_map: {
      default: '',
      day_default: '',
      night_default: '',
      day_clear: '',
      day_cloudy: '',
      day_rain: '',
      day_snow: '',
      day_storm: '',
      night_clear: '',
      night_cloudy: '',
      night_rain: '',
      night_snow: '',
      night_storm: '',
      morning_default: '',
      afternoon_default: '',
      evening_default: '',
      morning: '',
      afternoon: '',
      evening: '',
      night: '',
      morning_clear_idle: '',
      morning_clear_charging: '',
      morning_cloudy_idle: '',
      morning_cloudy_charging: '',
      morning_rain_idle: '',
      morning_rain_charging: '',
      morning_storm_idle: '',
      morning_storm_charging: '',
      afternoon_clear_idle: '',
      afternoon_clear_charging: '',
      afternoon_cloudy_idle: '',
      afternoon_cloudy_charging: '',
      afternoon_rain_idle: '',
      afternoon_rain_charging: '',
      afternoon_storm_idle: '',
      afternoon_storm_charging: '',
      evening_clear_idle: '',
      evening_clear_charging: '',
      evening_cloudy_idle: '',
      evening_cloudy_charging: '',
      evening_rain_idle: '',
      evening_rain_charging: '',
      evening_storm_idle: '',
      evening_storm_charging: '',
      day_clear_idle: '',
      day_clear_charging: '',
      night_clear_idle: '',
      night_clear_charging: ''
    },
    scene_component_map: {},
    scene_path_map: {},
    paths: {
      line_solar_load: 'M 351 292 L 352 338 L 352 338',
      line_grid_load: 'M 434 402 Q 434 402 351 375 Q 352 340 351 341',
      line_battery_load: 'M 310 348 Q 353 339 352 338',
      line_junction_home_load: 'M 354 338 Q 386 330 408 324',
      line_wallbox_ev: 'M 164 322 Q 160 368 182 344',
      line_wallbox_ev2: 'M 148 312 Q 126 310 112 316',
      line_solar_grid: 'M 350 292 L 352 374 L 434 402',
      line_solar_battery: 'M 350 292 L 352 338 L 312 348',
      line_grid_battery: 'M 352 340 L 312 348'
    }
  });

  function deepMerge(base, extra) {
    const out = { ...base };
    Object.keys(extra || {}).forEach((k) => {
      const bv = out[k];
      const ev = extra[k];
      if (bv && ev && typeof bv === 'object' && typeof ev === 'object' && !Array.isArray(bv) && !Array.isArray(ev)) {
        out[k] = deepMerge(bv, ev);
      } else {
        out[k] = ev;
      }
    });
    return out;
  }

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function safeNum(value, fallback = 0) {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function toWatt(entityState) {
    if (!entityState) return 0;
    const raw = safeNum(entityState.state, 0);
    const unit = String(
      entityState.attributes?.unit_of_measurement ||
      entityState.attributes?.unit ||
      'W'
    ).trim().toLowerCase();
    if (unit === 'kw') return raw * 1000;
    if (unit === 'mw') return raw * 1000000;
    return raw;
  }

  function toPct(entityState, fallback = 0) {
    if (!entityState) return fallback;
    const candidates = [
      entityState.state,
      entityState.attributes?.battery_level,
      entityState.attributes?.battery,
      entityState.attributes?.battery_percent,
      entityState.attributes?.battery_percentage,
      entityState.attributes?.raw_soc,
      entityState.attributes?.percentage,
      entityState.attributes?.level,
      entityState.attributes?.usable_battery_level
    ];
    for (const candidate of candidates) {
      const parsed = safeNum(candidate, Number.NaN);
      if (Number.isFinite(parsed)) return clamp(parsed, 0, 100);
    }
    return clamp(fallback, 0, 100);
  }

  function joinAsset(base, file) {
    const b = String(base || '').trim().replace(/\/+$/, '');
    const f = String(file || '').trim();
    if (!f) return '';
    if (f.startsWith('/') || /^https?:\/\//i.test(f)) return f;
    return b ? `${b}/${f.replace(/^\/+/, '')}` : f;
  }

  function sceneFileName(urlOrFile) {
    const value = String(urlOrFile || '').trim();
    if (!value) return '';
    const clean = value.split('#')[0].split('?')[0];
    const parts = clean.split('/');
    return parts[parts.length - 1] || '';
  }

  function compactStringMap(map) {
    const out = {};
    Object.entries(map || {}).forEach(([key, value]) => {
      if (typeof value !== 'string') return;
      const trimmed = value.trim();
      if (!trimmed) return;
      out[key] = trimmed;
    });
    return out;
  }

  function profileFromConfigPaths(pathsConfig) {
    const src = pathsConfig || {};
    const profile = {};
    Object.entries(FLOW_PATH_KEYS).forEach(([pathId, configKey]) => {
      const d = src[configKey];
      if (typeof d === 'string' && d.trim()) {
        profile[pathId] = d;
      }
    });
    return profile;
  }

  function normalizeLanguageCode(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/_/g, '-')
      .split('-')[0];
  }

  function resolveLanguage(preferred, hass) {
    const pref = normalizeLanguageCode(preferred);
    if (pref && pref !== 'auto' && SUPPORTED_LANGS.includes(pref)) return pref;

    const candidates = [
      hass?.locale?.language,
      hass?.language,
      typeof document !== 'undefined' ? document.documentElement?.lang : '',
      typeof navigator !== 'undefined' ? navigator.language : ''
    ];

    for (const candidate of candidates) {
      const code = normalizeLanguageCode(candidate);
      if (SUPPORTED_LANGS.includes(code)) return code;
    }
    return DEFAULT_LANG;
  }

  function getByPath(obj, path) {
    if (!obj || !path) return undefined;
    const parts = String(path).split('.');
    let cur = obj;
    for (const p of parts) {
      cur = cur?.[p];
      if (cur == null) break;
    }
    return cur;
  }

  function tLang(lang, key, fallback = '') {
    const normalized = normalizeLanguageCode(lang);
    const source = I18N[normalized] || I18N[DEFAULT_LANG];
    const value = getByPath(source, key);
    if (typeof value === 'string' && value.length) return value;

    const defaultValue = getByPath(I18N[DEFAULT_LANG], key);
    if (typeof defaultValue === 'string' && defaultValue.length) return defaultValue;
    return fallback || key;
  }

  function isTruthyPresenceState(entityState) {
    if (!entityState) return false;
    const state = String(entityState.state || '').trim().toLowerCase();
    if (!state || ['unknown', 'unavailable', 'none', 'null'].includes(state)) return false;
    if (['on', 'home', 'present', 'true', 'occupied', 'detected'].includes(state)) return true;
    if (['off', 'not_home', 'away', 'false', 'clear', 'idle'].includes(state)) return false;
    const numeric = Number(state);
    if (Number.isFinite(numeric)) return numeric > 0;
    return true;
  }

  function friendlyEntityName(entityState) {
    const name = String(entityState?.attributes?.friendly_name || '').trim();
    return name || '';
  }

  class EnergyFlowProCard extends HTMLElement {
    static getConfigElement() {
      return document.createElement('tesla-style-energy-flow-editor');
    }

    static getStubConfig() {
      return deepMerge(DEFAULT_CONFIG, {
        entities: {
          solar_power: 'sensor.solar_power',
          roof_a_power: 'sensor.roof_array_a_power',
          roof_a_voltage: 'sensor.roof_array_a_voltage',
          roof_a_current: 'sensor.roof_array_a_current',
          roof_b_power: 'sensor.roof_array_b_power',
          roof_b_voltage: 'sensor.roof_array_b_voltage',
          roof_b_current: 'sensor.roof_array_b_current',
          grid_power: 'sensor.grid_power',
          battery_power: 'sensor.battery_power',
          load_power: 'sensor.home_load_power',
          battery_level: 'sensor.battery_level',
          ev_power: 'sensor.ev_charging_power',
          ev_battery: 'sensor.ev_battery_level',
          ev_charge_switch: 'switch.ev_charge',
          ev_presence: 'binary_sensor.ev_presence',
          ev2_power: 'sensor.ev2_charging_power',
          ev2_battery: 'sensor.ev2_battery_level',
          ev2_charge_switch: 'switch.ev2_charge',
          ev2_presence: 'binary_sensor.ev2_presence',
          weather: 'weather.home',
          sun: 'sun.sun'
        }
      });
    }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._config = deepMerge(DEFAULT_CONFIG, {});
      this._hass = null;
      this._initialized = false;
      this._renderLang = DEFAULT_LANG;
      this._lastAppliedSceneFlowProfile = '';
      this._lastAppliedSceneFlowComponentProfile = '';
    }

    setConfig(config) {
      this._config = deepMerge(DEFAULT_CONFIG, config || {});
      this._initialized = false;
      this._lastAppliedSceneFlowProfile = '';
      this._lastAppliedSceneFlowComponentProfile = '';
      this._render();
    }

    set hass(hass) {
      this._hass = hass;
      this._render();
    }

    getCardSize() {
      return 7;
    }

    getGridOptions() {
      return {
        rows: 10,
        min_rows: 8
      };
    }

    _entityState(entityId) {
      if (!entityId || !this._hass) return null;
      return this._hass.states[entityId] || null;
    }

    _resolvedLang() {
      return resolveLanguage(this._config.language, this._hass);
    }

    _t(key, fallback = '') {
      return tLang(this._resolvedLang(), key, fallback);
    }

    _formatKW(watt) {
      const value = Math.abs(safeNum(watt, 0));
      const mode = String(this._config.power_unit_mode || 'auto').toLowerCase();
      if (mode === 'w') return `${Math.round(value)} W`;
      if (mode === 'kw') return `${(value / 1000).toFixed(1)} kW`;
      if (value < 1000) return `${Math.round(value)} W`;
      return `${(value / 1000).toFixed(1)} kW`;
    }

    _setText(id, value) {
      const el = this.shadowRoot.querySelector(id);
      if (el) el.textContent = value;
    }

    _toggleNode(id, active) {
      const el = this.shadowRoot.querySelector(id);
      if (!el) return;
      const isActive = !!active;
      el.classList.toggle('active', isActive);
      const group = el.closest('.flow-node') || el.closest('g');
      if (group) group.classList.toggle('inactive', !isActive);
    }

    _activatePath(id, cls, watt, minW = FLOW_MIN_W, reverse = false) {
      if (watt <= 0) return;
      if (watt < minW) return;
      const el = this.shadowRoot.querySelector(`#${id}`);
      if (!el) return;
      el.classList.add('active', cls);
      el.classList.toggle('flow-reverse', !!reverse);
    }

    _dominantFlowClass(solarW, batteryW, gridW, fallback) {
      if (gridW >= solarW && gridW >= batteryW) return 'flow-broken';
      if (batteryW >= solarW && batteryW >= gridW) return 'flow-green';
      if (solarW >= batteryW && solarW >= gridW) return 'flow-solar';
      return fallback || 'flow-solar';
    }

    _flowThreshold(key, fallback = FLOW_MIN_W) {
      const value = safeNum(this._config.thresholds?.[key], fallback);
      return Math.max(0, value);
    }

    _isEvCharging(evData) {
      const evMinW = Math.max(0, safeNum(this._config.ev_min_w, 150));
      const vehicles = Array.isArray(evData?.vehicles) ? evData.vehicles : [];
      if (vehicles.some((vehicle) => vehicle.hasPowerEntity)) {
        return vehicles.some((vehicle) => vehicle.power > evMinW);
      }
      return vehicles.some((vehicle) => vehicle.switchOn);
    }

    _collectEvData() {
      const evSlots = [
        {
          key: 'ev1',
          powerEntity: this._config.entities.ev_power,
          batteryEntity: this._config.entities.ev_battery,
          chargeSwitchEntity: this._config.entities.ev_charge_switch,
          presenceEntity: this._config.entities.ev_presence,
          customLabel: this._config.ev_label
        },
        {
          key: 'ev2',
          powerEntity: this._config.entities.ev2_power,
          batteryEntity: this._config.entities.ev2_battery,
          chargeSwitchEntity: this._config.entities.ev2_charge_switch,
          presenceEntity: this._config.entities.ev2_presence,
          customLabel: this._config.ev2_label
        }
      ];

      const vehicles = evSlots
        .map((slot) => {
          const configured = !!(slot.powerEntity || slot.batteryEntity || slot.chargeSwitchEntity || slot.presenceEntity);
          const powerState = this._entityState(slot.powerEntity);
          const batteryState = this._entityState(slot.batteryEntity);
          const switchState = this._entityState(slot.chargeSwitchEntity);
          const presenceState = this._entityState(slot.presenceEntity);
          const batteryPct = [
            toPct(batteryState, Number.NaN),
            toPct(powerState, Number.NaN),
            toPct(presenceState, Number.NaN),
            toPct(switchState, Number.NaN)
          ].find((value) => Number.isFinite(value));
          const derivedLabel = (
            friendlyEntityName(powerState) ||
            friendlyEntityName(batteryState) ||
            friendlyEntityName(presenceState) ||
            friendlyEntityName(switchState)
          );
          return {
            key: slot.key,
            configured,
            hasPowerEntity: !!powerState,
            hasBatteryEntity: Number.isFinite(batteryPct) || !!batteryState,
            power: Math.max(0, toWatt(powerState)),
            battery: Number.isFinite(batteryPct) ? batteryPct : 0,
            switchOn: switchState?.state === 'on',
            present: isTruthyPresenceState(presenceState),
            customLabel: String(slot.customLabel || '').trim(),
            derivedLabel
          };
        })
        .filter((vehicle) => vehicle.configured);

      const hasConfiguredSecondaryEv = vehicles.some((vehicle) => vehicle.key === 'ev2');
      const hasPresenceEntities = evSlots.some((slot) => !!slot.presenceEntity);
      const normalized = vehicles.map((vehicle) => ({
        ...vehicle,
        labelText: vehicle.customLabel || vehicle.derivedLabel || (vehicle.key === 'ev2'
          ? 'EV 2'
          : (hasConfiguredSecondaryEv ? 'EV 1' : this._t('card.node.ev', 'EV'))),
        batteryText: vehicle.hasBatteryEntity ? `${Math.round(vehicle.battery)}%` : '--%'
      }));
      const activeVehicles = normalized.filter((vehicle) => vehicle.present || vehicle.power > 0 || vehicle.switchOn);
      const presenceVehicles = normalized.filter((vehicle) => vehicle.present);
      const chargingVehicles = normalized.filter((vehicle) => vehicle.power > 0 || vehicle.switchOn);

      return {
        vehicles: normalized,
        totalPower: normalized.reduce((sum, vehicle) => sum + vehicle.power, 0),
        hasConfiguredSecondaryEv,
        hasPresenceEntities,
        activeVehicles,
        presenceVehicles,
        chargingVehicles
      };
    }

    _weatherGroup(weatherState) {
      const s = String(weatherState || '').toLowerCase();
      if (s === 'lightning') return 'storm';
      if (s === 'rainy' || s === 'pouring' || s === 'lightning-rainy') return 'rain';
      if (s === 'snowy' || s === 'snowy-rainy' || s === 'hail') return 'snow';
      if (s === 'cloudy' || s === 'partlycloudy' || s === 'fog' || s === 'windy' || s === 'windy-variant') return 'cloudy';
      return 'clear';
    }

    _scenePeriod(weatherState) {
      const sunEntity = this._entityState(this._config.entities.sun || 'sun.sun');
      const sunState = String(sunEntity?.state || '').toLowerCase();
      if (sunState === 'above_horizon') return 'day';
      if (sunState === 'below_horizon') return 'night';

      const ws = String(weatherState || '').toLowerCase();
      if (ws === 'clear-night') return 'night';

      const hour = new Date().getHours();
      return hour >= 7 && hour < 19 ? 'day' : 'night';
    }

    _sceneTimeSlot(period) {
      if (period === 'night') return 'night';
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 11) return 'morning';
      if (hour >= 17 && hour < 21) return 'evening';
      return 'afternoon';
    }

    _setSceneTone(timeSlot, weatherGroup) {
      const wrap = this.shadowRoot.querySelector('.wrap');
      if (!wrap) return;
      const stormy = weatherGroup === 'rain' || weatherGroup === 'storm' || weatherGroup === 'snow';
      wrap.dataset.sceneTone = stormy ? 'storm' : (timeSlot || 'afternoon');
    }

    _defaultBackgroundMap() {
      const base = this._config.background_asset_base || '/local/community/tesla-style-energy-flow/backgrounds';
      const out = {};
      Object.entries(SCENE_IMAGE_MAP).forEach(([k, v]) => {
        out[k] = joinAsset(base, v);
      });
      Object.entries(DUAL_CHARGING_SCENE_IMAGE_MAP).forEach(([k, v]) => {
        out[k] = joinAsset(base, v);
      });

      out.day_default = out.day_clear_idle || joinAsset(base, 'scene_day_clear_idle.png');
      out.night_default = out.night_clear_idle || joinAsset(base, 'scene_night_clear_idle.png');
      out.default = out.day_clear_idle || joinAsset(base, 'scene_day_clear_idle.png');

      // Alias senza charging state
      out.day_clear = out.day_clear_idle;
      out.day_cloudy = out.day_cloudy_idle;
      out.day_rain = out.day_rain_idle;
      out.day_snow = out.day_snow_idle;
      out.day_storm = out.day_storm_idle;
      out.night_clear = out.night_clear_idle;
      out.night_cloudy = out.night_cloudy_idle;
      out.night_rain = out.night_rain_idle;
      out.night_snow = out.night_snow_idle;
      out.night_storm = out.night_storm_idle;
      return out;
    }

    _sceneFlowPathMap() {
      return deepMerge(SCENE_FLOW_PATH_MAP, this._config.scene_path_map || {});
    }

    _sceneFlowComponentMap() {
      return deepMerge(SCENE_FLOW_COMPONENT_MAP, this._config.scene_component_map || {});
    }

    _resolveBackground(evCharging, hasSecondaryEv = false) {
      const cfg = this._config;
      if (!cfg.dynamic_background) return cfg.background;

      const weatherState = this._entityState(cfg.entities.weather)?.state || '';
      const period = this._scenePeriod(weatherState);
      const timeSlot = this._sceneTimeSlot(period);
      const weatherGroup = this._weatherGroup(weatherState);
      const chargeState = evCharging ? 'charging' : 'idle';
      const map = {
        ...this._defaultBackgroundMap(),
        ...compactStringMap(cfg.background_map || {})
      };

      if (hasSecondaryEv && evCharging) {
        const dualExactKey = `${period}_${weatherGroup}_dual_charging`;
        const dualExactUrl = String(map[dualExactKey] || '').trim();
        if (dualExactUrl) return dualExactUrl;

        const dualClearKey = `${period}_clear_dual_charging`;
        const dualClearUrl = String(map[dualClearKey] || '').trim();
        if (dualClearUrl) return dualClearUrl;
      }

      const timeExactKey = `${timeSlot}_${weatherGroup}_${chargeState}`;
      const timeExactUrl = String(map[timeExactKey] || '').trim();
      if (timeExactUrl) return timeExactUrl;

      const timeClearKey = `${timeSlot}_clear_${chargeState}`;
      const timeClearUrl = String(map[timeClearKey] || '').trim();
      if (timeClearUrl) return timeClearUrl;

      const timeWeatherKey = `${timeSlot}_${weatherGroup}`;
      const timeWeatherUrl = String(map[timeWeatherKey] || '').trim();
      if (timeWeatherUrl) return timeWeatherUrl;

      const timeDefaultKey = `${timeSlot}_default`;
      const timeDefaultKeyUrl = String(map[timeDefaultKey] || '').trim();
      if (timeDefaultKeyUrl) return timeDefaultKeyUrl;

      const timeDefaultUrl = String(map[timeSlot] || '').trim();
      if (timeDefaultUrl) return timeDefaultUrl;

      const exactKey = `${period}_${weatherGroup}_${chargeState}`;
      const exactUrl = String(map[exactKey] || '').trim();
      const exactFile = sceneFileName(exactUrl);
      const isNightLegacy = period === 'night' && LEGACY_SCENE_IMAGES.has(exactFile);
      if (exactUrl && !isNightLegacy) return exactUrl;

      const clearKey = `${period}_clear_${chargeState}`;
      const clearUrl = String(map[clearKey] || '').trim();
      if (clearUrl) return clearUrl;

      const periodDefault = String(map[`${period}_default`] || '').trim();
      if (periodDefault) return periodDefault;

      const defaultUrl = String(map.default || '').trim();
      if (defaultUrl) return defaultUrl;

      const fallbackFile = chargeState === 'charging'
        ? (hasSecondaryEv ? DUAL_CHARGING_SCENE_IMAGE_MAP.day_clear_dual_charging : SCENE_IMAGE_MAP.day_clear_charging)
        : SCENE_IMAGE_MAP.day_clear_idle;
      const legacyFallback = joinAsset(
        cfg.background_asset_base || '/local/community/tesla-style-energy-flow/backgrounds',
        fallbackFile
      );
      if (legacyFallback) return legacyFallback;

      return cfg.background;
    }

    _setBackground(url) {
      const img = this.shadowRoot.querySelector('#flow-scene-image');
      if (!img || !url) return;
      if (img.getAttribute('href') !== url) {
        img.setAttribute('href', url);
      }
    }

    _initialPathProfile() {
      const configProfile = profileFromConfigPaths(this._config.paths);
      const sceneKey = sceneFileName(this._config.background);
      const sceneProfile = this._sceneFlowPathMap()[sceneKey];
      if (!sceneProfile) return configProfile;
      return { ...configProfile, ...sceneProfile };
    }

    _applyPathProfile(profile, marker) {
      if (!profile || typeof profile !== 'object') return false;
      let applied = false;
      Object.keys(FLOW_PATH_KEYS).forEach((pathId) => {
        const d = profile[pathId];
        if (typeof d !== 'string' || !d.trim()) return;
        const path = this.shadowRoot.querySelector(`#${pathId}`);
        if (!path) return;
        if (path.getAttribute('d') !== d) {
          path.setAttribute('d', d);
        }
        applied = true;
      });
      if (applied && marker) this._lastAppliedSceneFlowProfile = marker;
      return applied;
    }

    _applySceneFlowPaths(sceneHref) {
      const sceneKey = sceneFileName(sceneHref);
      const sceneProfile = this._sceneFlowPathMap()[sceneKey];
      if (sceneProfile) {
        if (this._lastAppliedSceneFlowProfile !== sceneKey) {
          this._applyPathProfile(sceneProfile, sceneKey);
        }
        return;
      }
      if (this._lastAppliedSceneFlowProfile !== '__config__') {
        const fallbackProfile = profileFromConfigPaths(this._config.paths);
        this._applyPathProfile(fallbackProfile, '__config__');
      }
    }

    _applyComponentProfile(profile, marker) {
      if (!profile || typeof profile !== 'object') return false;
      let applied = false;
      Object.keys(FLOW_COMPONENT_BINDINGS).forEach((componentKey) => {
        const binding = FLOW_COMPONENT_BINDINGS[componentKey];
        const values = profile[componentKey];
        if (!binding || !values || typeof values !== 'object') return;
        const target = this.shadowRoot.querySelector(`#${binding.id}`);
        if (!target) return;
        const attrs = {};
        binding.attrs.forEach((attr) => {
          if (!Object.prototype.hasOwnProperty.call(values, attr)) return;
          attrs[attr] = values[attr];
        });
        if (this._setSvgAttrs(target, attrs)) applied = true;
      });
      if (this._alignCompactValueRows()) applied = true;
      if (this._alignLabelPowerColumns()) applied = true;
      if (this._fitTextBlocksToViewBox()) applied = true;
      if (this._alignCompactValueRows()) applied = true;
      if (this._alignGuideTextClearance()) applied = true;
      if (applied && marker) this._lastAppliedSceneFlowComponentProfile = marker;
      return applied;
    }

    _setSvgAttrs(targetOrSelector, attrs) {
      const target = typeof targetOrSelector === 'string'
        ? this.shadowRoot.querySelector(targetOrSelector)
        : targetOrSelector;
      if (!target || !attrs || typeof attrs !== 'object') return false;
      let applied = false;
      Object.entries(attrs).forEach(([attr, value]) => {
        if (value === undefined || value === null) return;
        const nextValue = String(value);
        if (target.getAttribute(attr) === nextValue) return;
        target.setAttribute(attr, nextValue);
        applied = true;
      });
      return applied;
    }

    _alignCompactValueRow(powerSelector, arrowSelector, percentSelector) {
      const power = this.shadowRoot.querySelector(powerSelector);
      if (!power) return false;
      const powerX = safeNum(power.getAttribute('x'), -8);
      const powerY = safeNum(power.getAttribute('y'), 97);
      const arrowApplied = this._setSvgAttrs(arrowSelector, { x: powerX + COMPACT_VALUE_ROW.arrowOffsetX, y: powerY });
      const percentApplied = this._setSvgAttrs(percentSelector, { x: powerX + COMPACT_VALUE_ROW.percentOffsetX, y: powerY });
      return arrowApplied || percentApplied;
    }

    _alignCompactValueRows() {
      let applied = false;
      [
        ['#flow-battery-power', '#flow-battery-arrow', '#flow-battery-pct'],
        ['#flow-ev-power', '#flow-ev-arrow', '#flow-ev-pct'],
        ['#flow-ev2-power', '#flow-ev2-arrow', '#flow-ev2-pct']
      ].forEach(([powerSelector, arrowSelector, percentSelector]) => {
        if (this._alignCompactValueRow(powerSelector, arrowSelector, percentSelector)) applied = true;
      });
      return applied;
    }

    _alignLabelPowerColumns() {
      let applied = false;
      GUIDE_ALIGNED_TEXT_PAIRS.forEach(([labelSelector, powerSelector, guideSelector]) => {
        const label = this.shadowRoot.querySelector(labelSelector);
        const power = this.shadowRoot.querySelector(powerSelector);
        if (!label || !power) return;
        const guide = this.shadowRoot.querySelector(guideSelector);
        const targetX = guide?.getAttribute('x1') ?? power.getAttribute('x');
        if (targetX === null) return;
        if (this._setSvgAttrs(label, { x: targetX })) applied = true;
        if (this._setSvgAttrs(power, { x: targetX })) applied = true;
      });
      return applied;
    }

    _sceneViewBox() {
      const sceneScale = clamp(safeNum(this._config.scene_scale, 1), 0.6, 1.4);
      return {
        minY: 230 - (230 / sceneScale),
        maxY: 230 + (230 / sceneScale)
      };
    }

    _elementSceneY(el) {
      if (!el) return 0;
      let y = safeNum(el.getAttribute('y'), 0);
      let node = el.parentElement;
      while (node && node.tagName?.toLowerCase() !== 'svg') {
        const transform = node.getAttribute?.('transform') || '';
        const match = transform.match(/translate\(\s*[-\d.]+(?:[,\s]+([-\d.]+))?/);
        if (match) y += safeNum(match[1], 0);
        node = node.parentElement;
      }
      return y;
    }

    _shiftTextY(targets, delta) {
      let applied = false;
      targets.forEach((target) => {
        const y = safeNum(target.getAttribute('y'), 0);
        if (this._setSvgAttrs(target, { y: Number((y + delta).toFixed(2)) })) applied = true;
      });
      return applied;
    }

    _shiftGuideY(guide, delta) {
      const y1 = safeNum(guide.getAttribute('y1'), 0);
      const y2 = safeNum(guide.getAttribute('y2'), y1);
      return this._setSvgAttrs(guide, {
        y1: Number((y1 + delta).toFixed(2)),
        y2: Number((y2 + delta).toFixed(2))
      });
    }

    _fitTextBlockToViewBox(selectors, viewBox) {
      const targets = selectors
        .map((selector) => this.shadowRoot.querySelector(selector))
        .filter(Boolean);
      if (!targets.length) return false;
      const baselines = targets.map((target) => this._elementSceneY(target));
      const top = Math.min(...baselines);
      const bottom = Math.max(...baselines);
      const minY = viewBox.minY + VIEWBOX_TEXT_FIT.margin;
      const maxY = viewBox.maxY - VIEWBOX_TEXT_FIT.margin;
      let delta = 0;
      if (top < minY) delta = minY - top;
      if (bottom + delta > maxY) delta = maxY - bottom;
      if (!delta) return false;
      return this._shiftTextY(targets, delta);
    }

    _fitGuideTextPairToViewBox(label, power, guide, viewBox) {
      const bottom = Math.max(this._elementSceneY(label), this._elementSceneY(power));
      const maxY = viewBox.maxY - VIEWBOX_TEXT_FIT.margin;
      if (bottom <= maxY) return false;
      const y1 = safeNum(guide.getAttribute('y1'), 0);
      const y2 = safeNum(guide.getAttribute('y2'), y1);
      const guideTop = Math.min(y1, y2);
      const powerY = safeNum(power.getAttribute('y'), 0);
      const labelY = safeNum(label.getAttribute('y'), powerY - VIEWBOX_TEXT_FIT.labelPowerGap);
      const gap = Math.abs(powerY - labelY) || VIEWBOX_TEXT_FIT.labelPowerGap;
      const nextPowerY = guideTop - this._guideTextGap();
      const nextLabelY = nextPowerY - gap;
      let applied = false;
      if (this._setSvgAttrs(label, { y: nextLabelY })) applied = true;
      if (this._setSvgAttrs(power, { y: nextPowerY })) applied = true;
      const fitted = this._fitTextBlockToViewBox([`#${label.id}`, `#${power.id}`], viewBox);
      return applied || fitted;
    }

    _fitBatteryBlockToViewBox(viewBox) {
      const label = this.shadowRoot.querySelector('#flow-battery-label');
      const power = this.shadowRoot.querySelector('#flow-battery-power');
      const guide = this.shadowRoot.querySelector('#flow-battery-guide');
      if (!label || !power || !guide) return false;
      const baselines = [label, power].map((target) => this._elementSceneY(target));
      const top = Math.min(...baselines);
      const bottom = Math.max(...baselines);
      const minY = viewBox.minY + VIEWBOX_TEXT_FIT.margin;
      const maxY = viewBox.maxY - VIEWBOX_TEXT_FIT.margin;
      let delta = 0;
      if (top < minY) delta = minY - top;
      if (bottom + delta > maxY) delta = maxY - bottom;
      if (!delta) return false;
      let applied = false;
      if (this._shiftTextY([label, power], delta)) applied = true;
      if (this._shiftGuideY(guide, delta)) applied = true;
      return applied;
    }

    _fitTextBlocksToViewBox() {
      const viewBox = this._sceneViewBox();
      let applied = false;
      GUIDE_ALIGNED_TEXT_PAIRS.forEach(([labelSelector, powerSelector, guideSelector]) => {
        const label = this.shadowRoot.querySelector(labelSelector);
        const power = this.shadowRoot.querySelector(powerSelector);
        const guide = this.shadowRoot.querySelector(guideSelector);
        if (!label || !power || !guide) return;
        if (this._fitGuideTextPairToViewBox(label, power, guide, viewBox)) applied = true;
        if (this._fitTextBlockToViewBox([labelSelector, powerSelector], viewBox)) applied = true;
      });
      if (this._fitBatteryBlockToViewBox(viewBox)) applied = true;
      return applied;
    }

    _guideTextGap() {
      const fontScale = clamp(safeNum(this._config.font_scale, 1), 0.75, 1.35);
      return GUIDE_TEXT_CLEARANCE.base + ((fontScale - 1) * GUIDE_TEXT_CLEARANCE.scaleExtra);
    }

    _moveGuideEndpoint(guide, attr, value) {
      return this._setSvgAttrs(guide, { [attr]: Number(value.toFixed(2)) });
    }

    _alignGuideTextClearance() {
      const gap = this._guideTextGap();
      let applied = false;
      GUIDE_CLEARANCE_TEXT_PAIRS.forEach(([labelSelector, powerSelector, guideSelector]) => {
        const label = this.shadowRoot.querySelector(labelSelector);
        const power = this.shadowRoot.querySelector(powerSelector);
        const guide = this.shadowRoot.querySelector(guideSelector);
        if (!label || !power || !guide) return;

        const labelY = safeNum(label.getAttribute('y'), 0);
        const powerY = safeNum(power.getAttribute('y'), labelY);
        const textTop = Math.min(labelY, powerY);
        const textBottom = Math.max(labelY, powerY);
        const y1 = safeNum(guide.getAttribute('y1'), 0);
        const y2 = safeNum(guide.getAttribute('y2'), y1);
        const guideTop = Math.min(y1, y2);
        const guideBottom = Math.max(y1, y2);
        const textCenter = (textTop + textBottom) / 2;
        const guideCenter = (guideTop + guideBottom) / 2;

        if (textCenter <= guideCenter) {
          const nearAttr = y1 <= y2 ? 'y1' : 'y2';
          const nearValue = nearAttr === 'y1' ? y1 : y2;
          const nextNear = Math.max(nearValue, textBottom + gap);
          if (this._moveGuideEndpoint(guide, nearAttr, nextNear)) applied = true;
        } else {
          const nearAttr = y1 >= y2 ? 'y1' : 'y2';
          const nearValue = nearAttr === 'y1' ? y1 : y2;
          const nextNear = Math.min(nearValue, textTop - gap);
          if (this._moveGuideEndpoint(guide, nearAttr, nextNear)) applied = true;
        }
      });
      return applied;
    }

    _applySceneFlowComponents(sceneHref) {
      const sceneKey = sceneFileName(sceneHref);
      const map = this._sceneFlowComponentMap();
      const sceneProfile = map[sceneKey] || map['scene_day_clear_idle.png'];
      const marker = map[sceneKey] ? sceneKey : 'scene_day_clear_idle.png';
      if (!sceneProfile) return;
      if (this._lastAppliedSceneFlowComponentProfile !== marker) {
        this._applyComponentProfile(sceneProfile, marker);
      }
    }

    _renderStatic() {
      const cfg = this._config;
      const p = this._initialPathProfile();
      const showLabelsClass = cfg.show_labels ? '' : 'hide-labels';
      const titleText = String(cfg.title || '');
      const titleHtml = (cfg.show_header !== false && titleText) ? `<div class="card-title">${titleText}</div>` : '';
      const sceneScale = clamp(safeNum(cfg.scene_scale, 1), 0.6, 1.4);
      const fontScale = clamp(safeNum(cfg.font_scale, 1), 0.75, 1.35);
      const pathD = (id, configKey) => p[id] || cfg.paths?.[configKey] || DEFAULT_CONFIG.paths[configKey];
      this._lastAppliedSceneFlowProfile = '';
      this._lastAppliedSceneFlowComponentProfile = '';

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
          }
          ha-card {
            overflow: hidden;
          }
          .wrap {
            padding: 0;
            --flow-font-scale: ${fontScale};
          }
          .card-title {
            font-size: calc(14px * var(--flow-font-scale));
            font-weight: 600;
            letter-spacing: 0.04em;
            padding: 14px 14px 8px;
            color: var(--primary-text-color);
          }
          .scene {
            padding: 0;
          }
          svg {
            width: 100%;
            height: auto;
            display: block;
            border-radius: 16px;
            border: 0;
            background: #020617;
          }
          .flow-scene-dim {
            fill: #020817;
            opacity: 0.34;
          }
          .flow-sky-dim {
            fill: url(#flow-sky-fade);
            opacity: 0.55;
          }
          .flow-bottom-dim {
            fill: url(#flow-bottom-fade);
            opacity: 0.42;
          }
          .flow-vignette {
            fill: url(#flow-vignette);
            opacity: 0.5;
          }
          .wrap[data-scene-tone="morning"] .flow-scene-dim {
            fill: #08213c;
            opacity: 0.36;
          }
          .wrap[data-scene-tone="morning"] .flow-sky-dim {
            opacity: 0.45;
          }
          .wrap[data-scene-tone="afternoon"] .flow-scene-dim {
            fill: #06111f;
            opacity: 0.4;
          }
          .wrap[data-scene-tone="afternoon"] .flow-sky-dim {
            opacity: 0.66;
          }
          .wrap[data-scene-tone="evening"] .flow-scene-dim {
            fill: #080f1c;
            opacity: 0.48;
          }
          .wrap[data-scene-tone="evening"] .flow-sky-dim {
            opacity: 0.58;
          }
          .wrap[data-scene-tone="night"] .flow-scene-dim,
          .wrap[data-scene-tone="storm"] .flow-scene-dim {
            fill: #020712;
            opacity: 0.58;
          }
          .wrap[data-scene-tone="storm"] .flow-sky-dim {
            opacity: 0.72;
          }
          .flow-node-bg {
            fill: rgba(255,255,255,0.08);
            transition: fill 0.2s ease, filter 0.2s ease;
            display: none;
          }
          .flow-node-bg.active {
            fill: rgba(255,255,255,0.72);
            filter: drop-shadow(0 0 6px rgba(255,255,255,0.35));
          }
          .flow-node-guide {
            stroke: rgba(214, 218, 224, 0.48);
            stroke-width: 1.15;
            stroke-linecap: round;
            opacity: 0.8;
          }
          .flow-label,
          .flow-power,
          .flow-pct,
          .flow-arrow,
          .flow-status {
            fill: #f8fafc;
            text-shadow: 0 1px 2px rgba(2, 6, 23, 0.58);
            text-anchor: middle;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.95))
                    drop-shadow(0 0 10px rgba(0, 0, 0, 0.78));
          }
          .flow-label {
            font-size: calc(10px * var(--flow-font-scale));
            font-weight: 700;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            fill: rgba(198, 202, 208, 0.78);
          }
          .flow-power {
            font-size: calc(15.5px * var(--flow-font-scale));
            font-weight: 600;
          }
          .flow-pct {
            font-size: calc(14px * var(--flow-font-scale));
            font-weight: 600;
          }
          .flow-arrow {
            fill: #2ee89b;
            font-size: calc(9px * var(--flow-font-scale));
            font-weight: 800;
          }
          #flow-battery-power,
          #flow-ev-power,
          #flow-ev2-power {
            text-anchor: end;
          }
          #flow-battery-arrow,
          #flow-ev-arrow,
          #flow-ev2-arrow {
            text-anchor: middle;
          }
          #flow-battery-pct,
          #flow-ev-pct,
          #flow-ev2-pct {
            text-anchor: start;
          }
          .flow-status {
            font-size: calc(8.5px * var(--flow-font-scale));
            font-weight: 600;
            opacity: 0.9;
            display: none;
          }
          .roof-meta {
            fill: #f8fafc;
            text-shadow: 0 1px 2px rgba(2, 6, 23, 0.55);
            text-anchor: middle;
            font-family: sans-serif;
            filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.82))
                    drop-shadow(0 0 9px rgba(0, 0, 0, 0.62));
          }
          .roof-meta-label {
            font-size: calc(9px * var(--flow-font-scale));
            font-weight: 700;
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }
          .roof-meta-value {
            font-size: calc(8px * var(--flow-font-scale));
            font-weight: 600;
          }
          #flow-battery-status {
            display: inline;
            font-size: calc(9px * var(--flow-font-scale));
            letter-spacing: 0.05em;
          }
          .flow-node.inactive .flow-label,
          .flow-node.inactive .flow-power,
          .flow-node.inactive .flow-pct,
          .flow-node.inactive .flow-arrow,
          .flow-node.inactive .flow-status {
            fill: rgba(148, 163, 184, 0.72) !important;
            opacity: 0.45;
            text-shadow: none;
            filter: none;
          }
          .flow-node.inactive .flow-node-guide {
            opacity: 0.48;
          }
          .flow-node.inactive #flow-battery-arrow {
            fill: #2ee89b !important;
            opacity: 0.95;
            filter: drop-shadow(0 0 5px rgba(46, 232, 155, 0.46));
          }
          .flow-node.inactive #flow-battery-pct {
            fill: #f8fafc !important;
            opacity: 0.95;
            text-shadow: 0 1px 2px rgba(2, 6, 23, 0.55);
            filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.95))
                    drop-shadow(0 0 10px rgba(0, 0, 0, 0.78))
                    drop-shadow(0 0 16px rgba(0, 0, 0, 0.52));
          }
          .ev-hidden {
            display: none;
          }
          .battery-hidden {
            display: none;
          }
          .roof-hidden {
            display: none;
          }
          .flow-line {
            fill: none;
            stroke: rgba(191, 219, 254, 0.22);
            stroke-width: 1.95;
            opacity: 0;
            stroke-linecap: round;
            stroke-linejoin: round;
            transition: opacity 0.18s ease, stroke-width 0.18s ease;
          }
          .flow-line.active {
            opacity: 1;
            stroke-dasharray: var(--flow-seg, 62) var(--flow-gap, 82);
            animation: flowStream var(--flow-speed, 1.9s) linear infinite, flowPulse var(--flow-fade, 1.45s) ease-in-out infinite;
            filter: drop-shadow(0 0 3px var(--flow-glow, rgba(125, 249, 255, 0.4)))
                    drop-shadow(0 0 12px var(--flow-glow, rgba(125, 249, 255, 0.4)));
          }
          .flow-line.active.flow-reverse {
            animation: flowStreamReverse var(--flow-speed, 1.9s) linear infinite, flowPulse var(--flow-fade, 1.45s) ease-in-out infinite;
          }
          .flow-line.active.flow-solar {
            stroke: #ffe066;
            --flow-glow: rgba(255, 224, 102, 0.72);
            --flow-seg: 64;
            --flow-gap: 80;
            --flow-speed: 1.75s;
            --flow-fade: 1.35s;
          }
          .flow-line.active.flow-green {
            stroke: #4ade80;
            --flow-glow: rgba(74, 222, 128, 0.7);
            --flow-seg: 62;
            --flow-gap: 82;
            --flow-speed: 1.9s;
            --flow-fade: 1.45s;
          }
          .flow-line.active.flow-broken {
            stroke: #ff5d73;
            --flow-glow: rgba(255, 93, 115, 0.7);
            --flow-seg: 40;
            --flow-gap: 96;
            --flow-speed: 1.35s;
            --flow-fade: 1.15s;
          }
          .hide-labels .flow-label,
          .hide-labels .flow-power,
          .hide-labels .flow-pct,
          .hide-labels .flow-status {
            display: none;
          }
          @keyframes flowStream {
            to { stroke-dashoffset: -144; }
          }
          @keyframes flowStreamReverse {
            to { stroke-dashoffset: 144; }
          }
          @keyframes flowPulse {
            0%, 100% { opacity: 0.8; stroke-width: 2.1; }
            45% { opacity: 1; stroke-width: 2.9; }
            82% { opacity: 0.9; stroke-width: 2.4; }
          }
        </style>
        <ha-card>
          <div class="wrap ${showLabelsClass}" data-scene-tone="afternoon">
            ${titleHtml}
            <div class="scene">
              <svg viewBox="${300 - (300 / sceneScale)} ${230 - (230 / sceneScale)} ${600 / sceneScale} ${460 / sceneScale}">
                <defs>
                  <linearGradient id="flow-sky-fade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#020817" stop-opacity="0.9"></stop>
                    <stop offset="62%" stop-color="#020817" stop-opacity="0.28"></stop>
                    <stop offset="100%" stop-color="#020817" stop-opacity="0"></stop>
                  </linearGradient>
                  <linearGradient id="flow-bottom-fade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#020817" stop-opacity="0"></stop>
                    <stop offset="56%" stop-color="#020817" stop-opacity="0.18"></stop>
                    <stop offset="100%" stop-color="#020817" stop-opacity="0.74"></stop>
                  </linearGradient>
                  <radialGradient id="flow-vignette" cx="50%" cy="43%" r="72%">
                    <stop offset="54%" stop-color="#020817" stop-opacity="0"></stop>
                    <stop offset="100%" stop-color="#020817" stop-opacity="0.78"></stop>
                  </radialGradient>
                </defs>
                <image id="flow-scene-image" href="${cfg.background}" x="0" y="0" width="600" height="460" preserveAspectRatio="xMidYMid slice"></image>
                <rect class="flow-scene-dim" x="0" y="0" width="600" height="460"></rect>
                <rect class="flow-sky-dim" x="0" y="0" width="600" height="260"></rect>
                <rect class="flow-bottom-dim" x="0" y="230" width="600" height="230"></rect>
                <rect class="flow-vignette" x="0" y="0" width="600" height="460"></rect>

                <path id="line-solar-load" class="flow-line" d="${pathD('line-solar-load', 'line_solar_load')}"></path>
                <path id="line-grid-load" class="flow-line" d="${pathD('line-grid-load', 'line_grid_load')}"></path>
                <path id="line-battery-load" class="flow-line" d="${pathD('line-battery-load', 'line_battery_load')}"></path>
                <path id="line-junction-home-load" class="flow-line" d="${pathD('line-junction-home-load', 'line_junction_home_load')}"></path>
                <path id="line-wallbox-ev" class="flow-line" d="${pathD('line-wallbox-ev', 'line_wallbox_ev')}"></path>
                <path id="line-wallbox-ev2" class="flow-line" d="${pathD('line-wallbox-ev2', 'line_wallbox_ev2')}"></path>
                <path id="line-solar-grid" class="flow-line" d="${pathD('line-solar-grid', 'line_solar_grid')}"></path>
                <path id="line-solar-battery" class="flow-line" d="${pathD('line-solar-battery', 'line_solar_battery')}"></path>
                <path id="line-grid-battery" class="flow-line" d="${pathD('line-grid-battery', 'line_grid_battery')}"></path>

                <g class="flow-node" transform="translate(286, 155)">
                  <circle class="flow-node-bg" id="node-solar-bg" cx="0" cy="0" r="5"></circle>
                  <line class="flow-node-guide" id="flow-solar-guide" x1="0" y1="-92" x2="0" y2="-12"></line>
                  <text class="flow-label" id="flow-solar-label" x="0" y="-96">${this._t('card.node.solar', 'Solare')}</text>
                  <text class="flow-power" id="flow-solar-power" x="0" y="-78">0.0 kW</text>
                  <text class="flow-status" id="flow-solar-status" x="0" y="-62">${this._t('card.status.inactive', 'INATTIVO')}</text>
                </g>

                <g id="roof-array-a-group">
                  <text class="roof-meta roof-meta-label" id="flow-roof-a-label" x="238" y="124">ARRAY A</text>
                  <text class="roof-meta roof-meta-value" id="flow-roof-a-power" x="238" y="136">0.0 kW</text>
                  <text class="roof-meta roof-meta-value" id="flow-roof-a-voltage" x="238" y="147">0 V</text>
                  <text class="roof-meta roof-meta-value" id="flow-roof-a-current" x="238" y="158">0 A</text>
                </g>

                <g id="roof-array-b-group">
                  <text class="roof-meta roof-meta-label" id="flow-roof-b-label" x="334" y="214">ARRAY B</text>
                  <text class="roof-meta roof-meta-value" id="flow-roof-b-power" x="334" y="226">0.0 kW</text>
                  <text class="roof-meta roof-meta-value" id="flow-roof-b-voltage" x="334" y="237">0 V</text>
                  <text class="roof-meta roof-meta-value" id="flow-roof-b-current" x="334" y="248">0 A</text>
                </g>

                <g class="flow-node" transform="translate(448, 336)">
                  <circle class="flow-node-bg" id="node-grid-bg" cx="0" cy="0" r="5"></circle>
                  <line class="flow-node-guide" id="flow-grid-guide" x1="0" y1="12" x2="0" y2="42"></line>
                  <text class="flow-label" id="flow-grid-label" x="6" y="67">${this._t('card.node.grid', 'Rete')}</text>
                  <text class="flow-power" id="flow-grid-power" x="6" y="85">0.0 kW</text>
                  <text class="flow-status" id="flow-grid-status" x="6" y="100">${this._t('card.status.connected', 'CONNESSA')}</text>
                </g>

                <g class="flow-node" transform="translate(465, 247)">
                  <circle class="flow-node-bg" id="node-load-bg" cx="0" cy="0" r="5"></circle>
                  <line class="flow-node-guide" id="flow-load-guide" x1="0" y1="-84" x2="0" y2="-12"></line>
                  <text class="flow-label" id="flow-load-label" x="0" y="-96">${this._t('card.node.home', 'Casa')}</text>
                  <text class="flow-power" id="flow-load-power" x="0" y="-78">0.0 kW</text>
                  <text class="flow-status" id="flow-load-status" x="0" y="-62">${this._t('card.status.consuming', 'IN CONSUMO')}</text>
                </g>

                <g class="flow-node" id="battery-node-group" transform="translate(314, 330)">
                  <circle class="flow-node-bg" id="node-battery-bg" cx="0" cy="0" r="5"></circle>
                  <line class="flow-node-guide" id="flow-battery-guide" x1="0" y1="12" x2="0" y2="42"></line>
                  <text class="flow-label" id="flow-battery-label" x="0" y="67">${this._t('card.node.battery', 'Batteria')}</text>
                  <text class="flow-power" id="flow-battery-power" x="-8" y="97" text-anchor="end">0.0 kW</text>
                  <text class="flow-arrow" id="flow-battery-arrow" x="0" y="97" text-anchor="middle"></text>
                  <text class="flow-pct" id="flow-battery-pct" x="8" y="97" text-anchor="start">--%</text>
                  <text class="flow-status" id="flow-battery-status" x="0" y="118">${this._t('card.status.waiting', 'IN ATTESA')}</text>
                </g>

                <g class="flow-node" id="ev-node-group" transform="translate(184, 332)">
                  <circle class="flow-node-bg" id="node-ev-bg" cx="0" cy="0" r="5"></circle>
                  <line class="flow-node-guide" id="flow-ev-guide" x1="0" y1="12" x2="0" y2="42"></line>
                  <text class="flow-label" id="flow-ev-label" x="0" y="61">${this._t('card.node.ev', 'EV')}</text>
                  <text class="flow-power" id="flow-ev-power" x="0" y="79" text-anchor="end">0.0 kW</text>
                  <text class="flow-arrow" id="flow-ev-arrow" x="8" y="79" text-anchor="middle"></text>
                  <text class="flow-pct" id="flow-ev-pct" x="16" y="79" text-anchor="start">--%</text>
                  <text class="flow-status" id="flow-ev-status" x="0" y="110">${this._t('card.status.off', 'OFF')}</text>
                </g>

                <g class="flow-node ev-hidden" id="ev2-node-group" transform="translate(106, 316)">
                  <circle class="flow-node-bg" id="node-ev2-bg" cx="0" cy="0" r="5"></circle>
                  <line class="flow-node-guide" id="flow-ev2-guide" x1="0" y1="-18" x2="0" y2="12"></line>
                  <text class="flow-label" id="flow-ev2-label" x="0" y="-26">EV 2</text>
                  <text class="flow-power" id="flow-ev2-power" x="0" y="-8" text-anchor="end">0.0 kW</text>
                  <text class="flow-arrow" id="flow-ev2-arrow" x="8" y="-8" text-anchor="middle"></text>
                  <text class="flow-pct" id="flow-ev2-pct" x="16" y="-8" text-anchor="start">--%</text>
                  <text class="flow-status" id="flow-ev2-status" x="0" y="24">${this._t('card.status.off', 'OFF')}</text>
                </g>
              </svg>
            </div>
          </div>
        </ha-card>
      `;
      this._initialized = true;
    }

    _renderDynamic() {
      const cfg = this._config;

      const solarPower = toWatt(this._entityState(cfg.entities.solar_power));
      const gridRaw = toWatt(this._entityState(cfg.entities.grid_power));
      const gridPower = cfg.grid_invert ? -gridRaw : gridRaw;
      const roofAPower = toWatt(this._entityState(cfg.entities.roof_a_power));
      const roofAVoltage = safeNum(this._entityState(cfg.entities.roof_a_voltage)?.state, 0);
      const roofACurrent = safeNum(this._entityState(cfg.entities.roof_a_current)?.state, 0);
      const roofBPower = toWatt(this._entityState(cfg.entities.roof_b_power));
      const roofBVoltage = safeNum(this._entityState(cfg.entities.roof_b_voltage)?.state, 0);
      const roofBCurrent = safeNum(this._entityState(cfg.entities.roof_b_current)?.state, 0);
      let batteryPower = toWatt(this._entityState(cfg.entities.battery_power));
      if (cfg.battery_invert) batteryPower *= -1;
      // Separate charge/discharge entities override the combined battery_power sensor.
      // charge entity is always positive (watts going into battery),
      // discharge entity is always positive (watts coming out of battery).
      if (cfg.entities.battery_charge_power || cfg.entities.battery_discharge_power) {
        const chargePower = Math.max(0, toWatt(this._entityState(cfg.entities.battery_charge_power)));
        const dischargePower = Math.max(0, toWatt(this._entityState(cfg.entities.battery_discharge_power)));
        batteryPower = chargePower - dischargePower;
      }
      const loadPower = toWatt(this._entityState(cfg.entities.load_power));
      const batteryLevel = toPct(this._entityState(cfg.entities.battery_level), 0);
      const batteryConfigured = !!(cfg.entities.battery_power || cfg.entities.battery_level);
      const evData = this._collectEvData();
      const evPower = evData.totalPower;
      const solarMin = this._flowThreshold('solar_min_w', FLOW_MIN_W);
      const gridMin = this._flowThreshold('grid_min_w', FLOW_MIN_W);
      const batteryMin = this._flowThreshold('battery_min_w', FLOW_MIN_W);
      const homeMin = Math.min(solarMin, gridMin, batteryMin);

      const evCharging = this._isEvCharging(evData);
      const sceneVehicles = evData.presenceVehicles.length ? evData.presenceVehicles : evData.chargingVehicles;
      const visibleVehicles = evData.activeVehicles.length ? evData.activeVehicles : evData.vehicles;
      const primaryVisibleVehicle = visibleVehicles[0] || null;
      const secondaryVisibleVehicle = visibleVehicles[1] || null;
      const evSceneActive = evData.hasPresenceEntities
        ? (evCharging || evData.presenceVehicles.length > 0)
        : evCharging;
      const useDualScene = evData.hasPresenceEntities
        ? (sceneVehicles.length > 1)
        : evData.hasConfiguredSecondaryEv;
      const evHideIdle = !!cfg.ev_hide_when_idle;
      const evNodeGroup = this.shadowRoot.querySelector('#ev-node-group');
      const ev2NodeGroup = this.shadowRoot.querySelector('#ev2-node-group');
      const batteryNodeGroup = this.shadowRoot.querySelector('#battery-node-group');
      const roofAGroup = this.shadowRoot.querySelector('#roof-array-a-group');
      const roofBGroup = this.shadowRoot.querySelector('#roof-array-b-group');
      const ev1 = primaryVisibleVehicle || { power: 0, batteryText: '--%', labelText: this._t('card.node.ev', 'EV'), switchOn: false, configured: false, present: false };
      const ev2 = secondaryVisibleVehicle || { power: 0, batteryText: '--%', labelText: 'EV 2', switchOn: false, configured: false, present: false };
      if (evNodeGroup) {
        evNodeGroup.classList.toggle('ev-hidden', !ev1.configured || (evHideIdle && !(ev1.power > 0 || ev1.switchOn || ev1.present)));
      }
      if (ev2NodeGroup) {
        ev2NodeGroup.classList.toggle('ev-hidden', !ev2.configured || (evHideIdle && !(ev2.power > 0 || ev2.switchOn || ev2.present)));
      }
      if (batteryNodeGroup) {
        batteryNodeGroup.classList.toggle('battery-hidden', !batteryConfigured);
      }
      if (roofAGroup) {
        roofAGroup.classList.toggle('roof-hidden', !(roofAPower > 0 || roofAVoltage > 0 || roofACurrent > 0));
      }
      if (roofBGroup) {
        roofBGroup.classList.toggle('roof-hidden', !(roofBPower > 0 || roofBVoltage > 0 || roofBCurrent > 0));
      }
      const weatherState = this._entityState(cfg.entities.weather)?.state || '';
      const period = this._scenePeriod(weatherState);
      const weatherGroup = this._weatherGroup(weatherState);
      this._setSceneTone(this._sceneTimeSlot(period), weatherGroup);
      const sceneHref = this._resolveBackground(evSceneActive, useDualScene);
      this._setBackground(sceneHref);
      this._applySceneFlowPaths(sceneHref);
      this._applySceneFlowComponents(sceneHref);

      this._setText('#flow-solar-power', this._formatKW(solarPower));
      this._setText('#flow-grid-power', this._formatKW(gridPower));
      this._setText('#flow-roof-a-label', String(cfg.roof_a_label || 'ARRAY A'));
      this._setText('#flow-roof-a-power', this._formatKW(roofAPower));
      this._setText('#flow-roof-a-voltage', `${Math.round(roofAVoltage)} V`);
      this._setText('#flow-roof-a-current', `${roofACurrent.toFixed(1)} A`);
      this._setText('#flow-roof-b-label', String(cfg.roof_b_label || 'ARRAY B'));
      this._setText('#flow-roof-b-power', this._formatKW(roofBPower));
      this._setText('#flow-roof-b-voltage', `${Math.round(roofBVoltage)} V`);
      this._setText('#flow-roof-b-current', `${roofBCurrent.toFixed(1)} A`);
      this._setText('#flow-load-power', this._formatKW(loadPower));
      this._setText('#flow-battery-power', batteryConfigured ? this._formatKW(batteryPower) : '');
      const batteryArrow = !batteryConfigured ? '' : (batteryPower > batteryMin ? '▲' : (batteryPower < -batteryMin ? '▼' : ''));
      this._setText('#flow-battery-arrow', batteryArrow);
      this._setText('#flow-battery-pct', batteryConfigured ? `${Math.round(batteryLevel)}%` : '');
      this._setText('#flow-ev-label', ev1.labelText || this._t('card.node.ev', 'EV'));
      this._setText('#flow-ev-power', this._formatKW(ev1.power || 0));
      const ev1Arrow = ((ev1.power || 0) > 0 || ev1.switchOn) ? '▲' : '';
      this._setText('#flow-ev-arrow', ev1Arrow);
      this._setText('#flow-ev-pct', ev1.batteryText || '--%');
      this._setText('#flow-ev2-label', ev2.labelText || 'EV 2');
      this._setText('#flow-ev2-power', this._formatKW(ev2.power || 0));
      const ev2Arrow = ((ev2.power || 0) > 0 || ev2.switchOn) ? '▲' : '';
      this._setText('#flow-ev2-arrow', ev2Arrow);
      this._setText('#flow-ev2-pct', ev2.batteryText || '--%');

      const batteryStatusEl = this.shadowRoot.querySelector('#flow-battery-status');
      if (batteryStatusEl) {
        // Charge/discharge direction is shown via the separate green arrow.
        // the textual status word is intentionally suppressed (Tesla-style).
        this._setText('#flow-battery-status', '');
        batteryStatusEl.style.display = 'none';
      }

      this._toggleNode('#node-solar-bg', solarPower > solarMin);
      this._toggleNode('#node-grid-bg', Math.abs(gridPower) > gridMin);
      this._toggleNode('#node-load-bg', loadPower > homeMin);
      this._toggleNode('#node-battery-bg', batteryConfigured && Math.abs(batteryPower) > batteryMin);
      this._toggleNode('#node-ev-bg', (ev1.power || 0) > 0 || ev1.switchOn || ev1.present);
      this._toggleNode('#node-ev2-bg', (ev2.power || 0) > 0 || ev2.switchOn || ev2.present);

      this.shadowRoot.querySelectorAll('.flow-line').forEach((line) => {
        line.classList.remove('active', 'flow-solar', 'flow-green', 'flow-broken', 'flow-reverse');
      });

      const solarPos = Math.max(0, solarPower);
      const loadPos = Math.max(0, loadPower);
      const gridImport = Math.max(0, gridPower);
      const gridExport = Math.max(0, -gridPower);
      const batteryCharge = Math.max(0, batteryPower);
      const batteryDischarge = Math.max(0, -batteryPower);
      const evDraw = evSceneActive ? Math.max(0, evPower) : 0;
      const ev1Draw = Math.max(0, ev1.power || 0);
      const ev2Draw = Math.max(0, ev2.power || 0);

      const solarToLoad = Math.min(solarPos, loadPos);
      const remainingLoad = Math.max(0, loadPos - solarToLoad);

      let solarRemaining = Math.max(0, solarPos - solarToLoad);
      let battDischargeRemaining = batteryDischarge;
      let gridImportRemaining = gridImport;

      const solarToEv = Math.min(evDraw, solarRemaining);
      solarRemaining = Math.max(0, solarRemaining - solarToEv);
      let evRemaining = Math.max(0, evDraw - solarToEv);

      const battToEv = Math.min(evRemaining, battDischargeRemaining);
      battDischargeRemaining = Math.max(0, battDischargeRemaining - battToEv);
      evRemaining = Math.max(0, evRemaining - battToEv);

      const gridToEv = Math.min(evRemaining, gridImportRemaining);
      gridImportRemaining = Math.max(0, gridImportRemaining - gridToEv);
      evRemaining = Math.max(0, evRemaining - gridToEv);

      const battToLoad = Math.min(remainingLoad, battDischargeRemaining);
      battDischargeRemaining = Math.max(0, battDischargeRemaining - battToLoad);
      let loadRemaining = Math.max(0, remainingLoad - battToLoad);

      const gridToLoad = Math.min(loadRemaining, gridImportRemaining);
      gridImportRemaining = Math.max(0, gridImportRemaining - gridToLoad);
      loadRemaining = Math.max(0, loadRemaining - gridToLoad);

      let battChargeRemaining = batteryCharge;
      const solarToBattery = Math.min(battChargeRemaining, solarRemaining);
      battChargeRemaining = Math.max(0, battChargeRemaining - solarToBattery);
      solarRemaining = Math.max(0, solarRemaining - solarToBattery);

      const gridToBattery = Math.min(battChargeRemaining, gridImportRemaining);
      gridImportRemaining = Math.max(0, gridImportRemaining - gridToBattery);

      const solarExport = Math.min(gridExport, solarRemaining);
      const remainingGridExport = Math.max(0, gridExport - solarExport);
      const batteryToGrid = Math.min(remainingGridExport, battDischargeRemaining);

      let gridToLoadVisual = gridToLoad;
      const gridImportVisual = gridImport;
      const gridExportVisual = gridExport;
      // Fallback visuale: se il carico e sostenuto di fatto dalla rete ma il calcolo cade sotto soglia.
      if (
        !evCharging &&
        gridToLoadVisual < gridMin &&
        gridImport >= gridMin &&
        loadPos >= homeMin &&
        solarToLoad < solarMin &&
        battToLoad < batteryMin
      ) {
        gridToLoadVisual = Math.min(gridImport, loadPos);
      }

      this._activatePath('line-solar-load', 'flow-solar', solarToLoad, solarMin);
      this._activatePath('line-grid-load', 'flow-broken', gridImportVisual, gridMin);
      this._activatePath('line-grid-load', 'flow-green', batteryToGrid, Math.max(1, Math.min(gridMin, batteryMin)), true);
      this._activatePath('line-battery-load', 'flow-green', Math.max(battToLoad, batteryToGrid), Math.max(1, Math.min(gridMin, batteryMin)));

      const homeTotal = solarToLoad + battToLoad + gridToLoadVisual;
      const homeCls = this._dominantFlowClass(solarToLoad, battToLoad, gridToLoadVisual, 'flow-solar');
      this._activatePath('line-junction-home-load', homeCls, homeTotal, homeMin);

      this._activatePath('line-solar-battery', 'flow-solar', solarToBattery, batteryMin);
      this._activatePath('line-grid-battery', 'flow-broken', gridToBattery, batteryMin);
      this._activatePath('line-solar-grid', 'flow-green', gridExportVisual, Math.max(1, gridMin));

      const evTotal = solarToEv + battToEv + gridToEv;
      const evCls = this._dominantFlowClass(solarToEv, battToEv, gridToEv, 'flow-green');
      const ev1Share = evDraw > 0 ? ev1Draw / evDraw : 0;
      const ev2Share = evDraw > 0 ? ev2Draw / evDraw : 0;
      this._activatePath('line-wallbox-ev', evCls, evTotal * ev1Share, 1);
      this._activatePath('line-wallbox-ev2', evCls, evTotal * ev2Share, 1);
    }

    _render() {
      if (!this._config) return;
      const lang = this._resolvedLang();
      if (!this._initialized || this._renderLang !== lang) {
        this._renderStatic();
        this._renderLang = lang;
      }
      if (this._hass) this._renderDynamic();
    }
  }

  class EnergyFlowProCardEditor extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._config = deepMerge(DEFAULT_CONFIG, {});
      this._hass = null;
      this._configSignature = JSON.stringify(this._config);
      this._pendingEditorUpdate = null;
      this._editingPath = '';
      this._positionDrag = null;
      this._positionEditorOpen = false;
      this._positionSceneKey = POSITION_EDITOR_SCENES[0]?.key || 'scene_day_clear_idle.png';
    }

    setConfig(config) {
      const incoming = { ...(config || {}) };
      if (
        (incoming.language === undefined || incoming.language === null || incoming.language === '') &&
        this._config?.language &&
        this._config.language !== 'auto'
      ) {
        incoming.language = this._config.language;
      }
      const nextConfig = deepMerge(DEFAULT_CONFIG, incoming);
      const nextSignature = JSON.stringify(nextConfig);
      if (nextSignature === this._configSignature) return;
      this._config = nextConfig;
      this._configSignature = nextSignature;
      if (this._isEditorBusy()) return;
      this._render();
    }

    set hass(hass) {
      this._hass = hass;
      if (this._isEditorBusy()) return;
      this._render();
    }

    _isEditorBusy() {
      return !!this._editingPath || !!this._pendingEditorUpdate || !!this._positionDrag || !!this._positionEditorOpen;
    }

    _emitConfig() {
      this.dispatchEvent(new CustomEvent('config-changed', {
        detail: { config: this._config },
        bubbles: true,
        composed: true
      }));
    }

    _applyEditorValue(path, value) {
      if (path === 'language') {
        const normalized = normalizeLanguageCode(value);
        value = (normalized === 'auto' || SUPPORTED_LANGS.includes(normalized)) ? normalized : 'auto';
      }
      const keys = path.split('.');
      const next = { ...this._config };
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        cur[k] = { ...(cur[k] || {}) };
        cur = cur[k];
      }
      cur[keys[keys.length - 1]] = value;
      this._config = deepMerge(DEFAULT_CONFIG, next);
      this._configSignature = JSON.stringify(this._config);
      return path;
    }

    _update(path, value) {
      this._applyEditorValue(path, value);
      this._emitConfig();
      if (path === 'language') this._render();
    }

    _queueEditorUpdate(path, value) {
      this._applyEditorValue(path, value);
      if (this._pendingEditorUpdate) clearTimeout(this._pendingEditorUpdate);
      this._pendingEditorUpdate = setTimeout(() => {
        this._pendingEditorUpdate = null;
        this._emitConfig();
      }, EDITOR_UPDATE_DEBOUNCE_MS);
    }

    _flushEditorUpdate() {
      if (!this._pendingEditorUpdate) return;
      clearTimeout(this._pendingEditorUpdate);
      this._pendingEditorUpdate = null;
      this._emitConfig();
    }

    _updateJson(path, raw) {
      try {
        const parsed = raw.trim() ? JSON.parse(raw) : {};
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false;
        this._update(path, parsed);
        return true;
      } catch (_error) {
        return false;
      }
    }

    _jsonString(path) {
      const value = this._getByPath(path);
      if (!value || typeof value !== 'object' || Array.isArray(value) || !Object.keys(value).length) return '{}';
      return JSON.stringify(value, null, 2);
    }

    _entityIdsByDomain(domain) {
      if (!this._hass) return [];
      return Object.keys(this._hass.states)
        .filter((id) => id.startsWith(`${domain}.`))
        .sort((a, b) => a.localeCompare(b));
    }

    _entityIdsByDomains(domains) {
      if (!this._hass) return [];
      const domainSet = new Set(Array.isArray(domains) ? domains : []);
      return Object.keys(this._hass.states)
        .filter((id) => domainSet.has(id.split('.')[0]))
        .sort((a, b) => a.localeCompare(b));
    }

    _getByPath(path) {
      const keys = path.split('.');
      let value = this._config;
      keys.forEach((k) => { value = value?.[k]; });
      return value;
    }

    _resolvedLang() {
      return resolveLanguage(this._config.language, this._hass);
    }

    _t(key, fallback = '') {
      return tLang(this._resolvedLang(), key, fallback);
    }

    _escapeHtml(value) {
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    _editorCommitEvent(el) {
      if (el.type === 'checkbox' || el.tagName === 'SELECT') return 'change';
      return el.dataset.commit || 'input';
    }

    _entitySelectRow(label, path, options, placeholder) {
      const current = String(this._getByPath(path) || '');
      const values = Array.isArray(options) ? [...options] : [];
      if (current && !values.includes(current)) values.unshift(current);
      const emptyLabel = this._escapeHtml(placeholder || this._t('editor.placeholder_select', '-- select --'));
      const opts = [`<option value="">${emptyLabel}</option>`]
        .concat(
          values.map((id) => {
            const selected = id === current ? ' selected' : '';
            return `<option value="${this._escapeHtml(id)}"${selected}>${this._escapeHtml(id)}</option>`;
          })
        )
        .join('');
      return `
        <label>${label}</label>
        <select class="entity-select" data-path="${path}">
          ${opts}
        </select>
      `;
    }

    _languageSelectRow() {
      const raw = normalizeLanguageCode(this._config.language || 'auto');
      const current = (raw === 'auto' || SUPPORTED_LANGS.includes(raw)) ? raw : 'auto';
      const opts = LANGUAGE_OPTIONS
        .map(({ value, labelKey }) => {
          const selected = value === current ? ' selected' : '';
          const label = this._t(labelKey, value.toUpperCase());
          return `<option value="${value}"${selected}>${this._escapeHtml(label)}</option>`;
        })
        .join('');
      return `
        <label>${this._t('editor.field_language', 'Language')}</label>
        <select data-path="language">
          ${opts}
        </select>
      `;
    }

    _powerUnitModeRow() {
      const current = String(this._config.power_unit_mode || 'auto').toLowerCase();
      const options = [
        { value: 'auto', label: 'Auto (W/kW)' },
        { value: 'w', label: 'Always W' },
        { value: 'kw', label: 'Always kW' }
      ];
      const opts = options
        .map(({ value, label }) => `<option value="${value}"${value === current ? ' selected' : ''}>${this._escapeHtml(label)}</option>`)
        .join('');
      return `
        <label>Power unit mode</label>
        <select data-path="power_unit_mode">
          ${opts}
        </select>
      `;
    }

    _sceneFlowComponentMap() {
      return deepMerge(SCENE_FLOW_COMPONENT_MAP, this._config.scene_component_map || {});
    }

    _selectedPositionScene() {
      const sceneKey = this._positionSceneKey || sceneFileName(this._config.background) || POSITION_EDITOR_SCENES[0]?.key;
      return POSITION_EDITOR_SCENES.some((scene) => scene.key === sceneKey)
        ? sceneKey
        : (POSITION_EDITOR_SCENES[0]?.key || 'scene_day_clear_idle.png');
    }

    _positionSceneOptions(selectedScene) {
      return POSITION_EDITOR_SCENES
        .map(({ key, label }) => {
          const selected = key === selectedScene ? ' selected' : '';
          return `<option value="${this._escapeHtml(key)}"${selected}>${this._escapeHtml(label)}</option>`;
        })
        .join('');
    }

    _positionEditorGroups(sceneKey) {
      return POSITION_EDITOR_GROUPS.filter((group) => {
        if (!group.scene) return true;
        if (group.scene === 'charging') return sceneKey.includes('charging');
        if (group.scene === 'dual_charging') return sceneKey.includes('dual_charging');
        return true;
      });
    }

    _positionValue(sceneKey, componentKey, attr) {
      const scene = this._sceneFlowComponentMap()[sceneKey] || {};
      return safeNum(scene[componentKey]?.[attr], 0);
    }

    _positionNodeOrigin(group) {
      return POSITION_EDITOR_NODE_ORIGINS[group.node] || Object.freeze({ x: 0, y: 0 });
    }

    _positionScenePoint(sceneKey, group, componentKey, xAttr = 'x', yAttr = 'y') {
      const origin = this._positionNodeOrigin(group);
      return {
        x: origin.x + this._positionValue(sceneKey, componentKey, xAttr),
        y: origin.y + this._positionValue(sceneKey, componentKey, yAttr)
      };
    }

    _positionPreviewBackground(sceneKey) {
      const base = this._config.background_asset_base || '/local/community/tesla-style-energy-flow/backgrounds';
      return joinAsset(base, sceneKey);
    }

    _positionPreviewTextCenter(sceneKey, group) {
      const x = this._positionScenePoint(sceneKey, group, group.guide, 'x1', 'y1').x;
      const label = this._positionScenePoint(sceneKey, group, group.label);
      const power = this._positionScenePoint(sceneKey, group, group.power);
      return {
        x,
        y: (label.y + power.y) / 2
      };
    }

    _positionPreviewGroup(sceneKey, group) {
      const guideStart = this._positionScenePoint(sceneKey, group, group.guide, 'x1', 'y1');
      const guideEndRaw = this._positionScenePoint(sceneKey, group, group.guide, 'x2', 'y2');
      const guideEnd = { x: guideStart.x, y: guideEndRaw.y };
      const label = {
        ...this._positionScenePoint(sceneKey, group, group.label),
        x: guideStart.x
      };
      const power = {
        ...this._positionScenePoint(sceneKey, group, group.power),
        x: guideStart.x
      };
      const textCenter = this._positionPreviewTextCenter(sceneKey, group);
      const title = this._escapeHtml(this._positionGroupTitle(group).toUpperCase());
      const scene = this._escapeHtml(sceneKey);
      return `
        <g class="position-preview-group" data-position-preview-group="${this._escapeHtml(group.node)}">
          <line class="position-preview-guide" data-preview-component="${this._escapeHtml(group.guide)}" x1="${guideStart.x}" y1="${guideStart.y}" x2="${guideEnd.x}" y2="${guideEnd.y}"></line>
          <g
            class="position-preview-text"
            data-drag-kind="text"
            data-position-scene-key="${scene}"
            data-position-node="${this._escapeHtml(group.node)}"
            data-position-label-component="${this._escapeHtml(group.label)}"
            data-position-power-component="${this._escapeHtml(group.power)}">
            <text class="position-preview-label" data-preview-component="${this._escapeHtml(group.label)}" x="${label.x}" y="${label.y}">${title}</text>
            <text class="position-preview-power" data-preview-component="${this._escapeHtml(group.power)}" x="${power.x}" y="${power.y}">0.0 kW</text>
            <circle class="position-text-grip" data-preview-text-grip="${this._escapeHtml(group.label)}" cx="${textCenter.x}" cy="${textCenter.y}" r="8"></circle>
          </g>
          <circle
            class="position-guide-handle"
            data-drag-kind="guide"
            data-position-scene-key="${scene}"
            data-position-node="${this._escapeHtml(group.node)}"
            data-position-component="${this._escapeHtml(group.guide)}"
            data-position-endpoint="1"
            cx="${guideStart.x}"
            cy="${guideStart.y}"
            r="7"></circle>
          <circle
            class="position-guide-handle"
            data-drag-kind="guide"
            data-position-scene-key="${scene}"
            data-position-node="${this._escapeHtml(group.node)}"
            data-position-component="${this._escapeHtml(group.guide)}"
            data-position-endpoint="2"
            cx="${guideEnd.x}"
            cy="${guideEnd.y}"
            r="7"></circle>
        </g>
      `;
    }

    _positionPreviewSvg(sceneKey) {
      const background = this._escapeHtml(this._positionPreviewBackground(sceneKey));
      return `
        <div class="position-preview-frame">
          <svg class="position-preview-svg" data-position-preview-svg data-position-scene-key="${this._escapeHtml(sceneKey)}" viewBox="0 0 600 460" preserveAspectRatio="xMidYMid meet">
            <image class="position-preview-image" href="${background}" x="0" y="0" width="600" height="460" preserveAspectRatio="xMidYMid slice"></image>
            <rect class="position-preview-dim" x="0" y="0" width="600" height="460"></rect>
            ${this._positionEditorGroups(sceneKey).map((group) => this._positionPreviewGroup(sceneKey, group)).join('')}
          </svg>
        </div>
      `;
    }

    _positionAxisInput(sceneKey, componentKey, attr, axis) {
      const value = this._positionValue(sceneKey, componentKey, attr);
      const path = `${sceneKey}:${componentKey}.${attr}`;
      return `
        <label class="position-axis-field">
          <span>${this._escapeHtml(axis)}</span>
          <input
            type="number"
            step="1"
            data-position-path="${this._escapeHtml(path)}"
            data-position-scene-key="${this._escapeHtml(sceneKey)}"
            data-position-component="${this._escapeHtml(componentKey)}"
            data-position-attr="${this._escapeHtml(attr)}"
            value="${value}">
        </label>
      `;
    }

    _positionPairRow(sceneKey, title, xComponentKey, xAttr, yComponentKey, yAttr) {
      return `
        <div class="position-pair-row">
          <div class="position-pair-title">${this._escapeHtml(title)}</div>
          ${this._positionAxisInput(sceneKey, xComponentKey, xAttr, 'X')}
          ${this._positionAxisInput(sceneKey, yComponentKey, yAttr, 'Y')}
        </div>
      `;
    }

    _positionGroupRows(sceneKey, group) {
      return `
        <div class="position-group">
          <div class="position-title">${this._escapeHtml(this._positionGroupTitle(group))}</div>
          <div class="position-pair-grid">
            ${this._positionPairRow(sceneKey, this._t('editor.position_field_label', 'Label'), group.label, 'x', group.label, 'y')}
            ${this._positionPairRow(sceneKey, this._t('editor.position_field_value', 'Value'), group.power, 'x', group.power, 'y')}
            ${this._positionPairRow(sceneKey, this._t('editor.position_field_guide_a', 'Guide A'), group.guide, 'x1', group.guide, 'y1')}
            ${this._positionPairRow(sceneKey, this._t('editor.position_field_guide_b', 'Guide B'), group.guide, 'x2', group.guide, 'y2')}
          </div>
        </div>
      `;
    }

    _positionEditorControls(options = {}) {
      const selectedScene = this._selectedPositionScene();
      const modalClass = options.modal ? ' position-groups-modal' : '';
      return `
        <label>${this._t('editor.position_field_scene', 'Scene')}</label>
        <select data-position-scene>
          ${this._positionSceneOptions(selectedScene)}
        </select>
        ${this._positionPreviewSvg(selectedScene)}
        <div class="position-groups${modalClass}">
          ${this._positionEditorGroups(selectedScene).map((group) => this._positionGroupRows(selectedScene, group)).join('')}
        </div>
      `;
    }

    _positionEditorModal() {
      if (!this._positionEditorOpen) return '';
      return `
        <div class="position-editor-modal" data-position-editor-modal>
          <div class="position-editor-panel">
            <div class="position-editor-header">
              <div>
                <div class="position-editor-kicker">${this._t('editor.position_modal_kicker', 'Scene positions')}</div>
                <div class="position-editor-title-row">
                  <h3>${this._t('editor.position_modal_title', 'Edit visually')}</h3>
                  <button type="button" class="position-close-button" data-close-position-editor aria-label="${this._t('editor.position_close_button', 'Close')}">${this._t('editor.position_close_button', 'Close')}</button>
                </div>
              </div>
            </div>
            <div class="position-editor-workspace">
              ${this._positionEditorControls({ modal: true })}
            </div>
          </div>
        </div>
      `;
    }

    _positionGroupTitle(group) {
      const key = POSITION_EDITOR_GROUP_I18N_KEYS[group.node];
      const base = key ? this._t(key, group.title) : group.title;
      if (group.node === 'ev') return `${base} 1`;
      if (group.node === 'ev2') return `${base} 2`;
      return base;
    }

    _positionGroupForComponent(componentKey) {
      return POSITION_EDITOR_GROUPS.find((group) => (
        group.label === componentKey ||
        group.power === componentKey ||
        group.guide === componentKey
      ));
    }

    _positionTextDragValues(sceneKey, group) {
      const x = this._positionValue(sceneKey, group.guide, 'x1');
      return [
        { componentKey: group.label, attr: 'x', value: x },
        { componentKey: group.label, attr: 'y', value: this._positionValue(sceneKey, group.label, 'y') },
        { componentKey: group.power, attr: 'x', value: x },
        { componentKey: group.power, attr: 'y', value: this._positionValue(sceneKey, group.power, 'y') },
        { componentKey: group.guide, attr: 'x1', value: x },
        { componentKey: group.guide, attr: 'x2', value: x }
      ];
    }

    _positionGuideDragValues(sceneKey, componentKey, endpoint) {
      return [
        { componentKey, attr: `y${endpoint}`, value: this._positionValue(sceneKey, componentKey, `y${endpoint}`) }
      ];
    }

    _positionLinkedChanges(sceneKey, componentKey, attr, value) {
      const group = this._positionGroupForComponent(componentKey);
      if (['x', 'x1', 'x2'].includes(attr) && group) {
        return [
          { componentKey: group.label, attr: 'x', value },
          { componentKey: group.power, attr: 'x', value },
          { componentKey: group.guide, attr: 'x1', value },
          { componentKey: group.guide, attr: 'x2', value }
        ];
      }
      return [{ componentKey, attr, value }];
    }

    _applyScenePositionChanges(sceneKey, changes, emit = true) {
      const nextMap = { ...(this._config.scene_component_map || {}) };
      const scene = { ...(nextMap[sceneKey] || {}) };
      changes.forEach(({ componentKey, attr, value }) => {
        const component = { ...(scene[componentKey] || {}) };
        component[attr] = Number(safeNum(value, 0).toFixed(2));
        scene[componentKey] = component;
      });
      nextMap[sceneKey] = scene;
      this._applyEditorValue('scene_component_map', nextMap);
      if (emit) this._emitConfig();
    }

    _updateSceneComponentPosition(sceneKey, componentKey, attr, value, emit = true) {
      const nextMap = { ...(this._config.scene_component_map || {}) };
      const scene = { ...(nextMap[sceneKey] || {}) };
      const component = { ...(scene[componentKey] || {}) };
      component[attr] = Number(safeNum(value, 0).toFixed(2));
      scene[componentKey] = component;
      nextMap[sceneKey] = scene;
      this._applyEditorValue('scene_component_map', nextMap);
      if (emit) this._emitConfig();
    }

    _queueScenePositionChanges(sceneKey, changes) {
      this._applyScenePositionChanges(sceneKey, changes, false);
      if (this._pendingEditorUpdate) clearTimeout(this._pendingEditorUpdate);
      this._pendingEditorUpdate = setTimeout(() => {
        this._pendingEditorUpdate = null;
        this._emitConfig();
      }, EDITOR_UPDATE_DEBOUNCE_MS);
    }

    _setPreviewAttrs(svg, selector, attrs) {
      const el = svg?.querySelector(selector);
      if (!el) return;
      Object.entries(attrs).forEach(([attr, value]) => {
        el.setAttribute(attr, Number(safeNum(value, 0).toFixed(2)));
      });
    }

    _updatePositionPreviewGroupDom(svg, sceneKey, group) {
      const guideStart = this._positionScenePoint(sceneKey, group, group.guide, 'x1', 'y1');
      const guideEndRaw = this._positionScenePoint(sceneKey, group, group.guide, 'x2', 'y2');
      const guideEnd = { x: guideStart.x, y: guideEndRaw.y };
      const label = {
        ...this._positionScenePoint(sceneKey, group, group.label),
        x: guideStart.x
      };
      const power = {
        ...this._positionScenePoint(sceneKey, group, group.power),
        x: guideStart.x
      };
      const textCenter = this._positionPreviewTextCenter(sceneKey, group);
      this._setPreviewAttrs(svg, `[data-preview-component="${group.label}"]`, label);
      this._setPreviewAttrs(svg, `[data-preview-component="${group.power}"]`, power);
      this._setPreviewAttrs(svg, `[data-preview-component="${group.guide}"]`, {
        x1: guideStart.x,
        y1: guideStart.y,
        x2: guideEnd.x,
        y2: guideEnd.y
      });
      this._setPreviewAttrs(svg, `[data-preview-text-grip="${group.label}"]`, { cx: textCenter.x, cy: textCenter.y });
      this._setPreviewAttrs(svg, `[data-position-component="${group.guide}"][data-position-endpoint="1"]`, { cx: guideStart.x, cy: guideStart.y });
      this._setPreviewAttrs(svg, `[data-position-component="${group.guide}"][data-position-endpoint="2"]`, { cx: guideEnd.x, cy: guideEnd.y });
    }

    _updatePositionPreviewInputs(sceneKey, changes) {
      changes.forEach(({ componentKey, attr, value }) => {
        const input = this.shadowRoot.querySelector(
          `input[data-position-scene-key="${sceneKey}"][data-position-component="${componentKey}"][data-position-attr="${attr}"]`
        );
        if (input && input !== this.shadowRoot.activeElement) input.value = Number(safeNum(value, 0).toFixed(2));
      });
    }

    _updatePositionPreviewDom(sceneKey, changes) {
      const svg = this.shadowRoot.querySelector('svg[data-position-preview-svg]');
      if (!svg) return;
      const groups = new Set();
      changes.forEach(({ componentKey }) => {
        const group = this._positionGroupForComponent(componentKey);
        if (group) groups.add(group);
      });
      groups.forEach((group) => this._updatePositionPreviewGroupDom(svg, sceneKey, group));
      this._updatePositionPreviewInputs(sceneKey, changes);
    }

    _positionPointerPoint(event, svg) {
      if (svg.createSVGPoint && svg.getScreenCTM()) {
        const point = svg.createSVGPoint();
        point.x = event.clientX;
        point.y = event.clientY;
        return point.matrixTransform(svg.getScreenCTM().inverse());
      }
      const rect = svg.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) / rect.width) * 600,
        y: ((event.clientY - rect.top) / rect.height) * 460
      };
    }

    _beginPositionDrag(event) {
      const handle = event.target.closest?.('[data-drag-kind]');
      if (!handle) return;
      const svg = handle.closest?.('svg[data-position-preview-svg]');
      if (!svg) return;
      event.preventDefault();
      handle.setPointerCapture?.(event.pointerId);
      const sceneKey = handle.dataset.positionSceneKey || this._selectedPositionScene();
      const start = this._positionPointerPoint(event, svg);
      const kind = handle.dataset.dragKind;
      const drag = {
        kind,
        handle,
        sceneKey,
        start,
        values: []
      };

      if (kind === 'text') {
        const group = this._positionGroupForComponent(handle.dataset.positionLabelComponent);
        if (group) drag.values = this._positionTextDragValues(sceneKey, group);
      } else if (kind === 'guide') {
        const componentKey = handle.dataset.positionComponent;
        const endpoint = handle.dataset.positionEndpoint === '2' ? '2' : '1';
        drag.values = this._positionGuideDragValues(sceneKey, componentKey, endpoint);
      }

      if (!drag.values.length) return;
      this._positionDrag = drag;
      this._editingPath = `position-drag:${sceneKey}:${kind}`;
      svg.classList.add('is-dragging');
    }

    _movePositionDrag(event) {
      if (!this._positionDrag) return;
      const svg = this.shadowRoot.querySelector('svg[data-position-preview-svg]');
      if (!svg) return;
      event.preventDefault();
      const point = this._positionPointerPoint(event, svg);
      const dx = point.x - this._positionDrag.start.x;
      const dy = point.y - this._positionDrag.start.y;
      const sceneKey = this._positionDrag.sceneKey;
      const changes = this._positionDrag.values.map(({ componentKey, attr, value }) => ({
        componentKey,
        attr,
        value: value + (attr.startsWith('x') ? dx : dy)
      }));
      this._queueScenePositionChanges(sceneKey, changes);
      this._updatePositionPreviewDom(sceneKey, changes);
    }

    _endPositionDrag(event) {
      if (!this._positionDrag) return;
      const svg = this.shadowRoot.querySelector('svg[data-position-preview-svg]');
      this._positionDrag.handle?.releasePointerCapture?.(event.pointerId);
      this._positionDrag = null;
      this._editingPath = '';
      svg?.classList.remove('is-dragging');
      this._flushEditorUpdate();
    }

    _render() {
      const sensorIds = this._entityIdsByDomain('sensor');
      const switchIds = this._entityIdsByDomain('switch');
      const presenceIds = this._entityIdsByDomains(['binary_sensor', 'device_tracker', 'person', 'input_boolean']);
      const weatherIds = this._entityIdsByDomain('weather');
      const sunIds = this._entityIdsByDomain('sun');

      const cfg = this._config;
      const b = cfg.background_map || {};

      this.shadowRoot.innerHTML = `
        <style>
          :host { display: block; }
          .wrap {
            padding: 12px;
            display: grid;
            gap: 12px;
          }
          .block {
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 10px;
            padding: 10px;
            display: grid;
            gap: 8px;
          }
          h4 {
            margin: 0;
            font-size: 13px;
            letter-spacing: 0.04em;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 6px;
          }
          label {
            font-size: 12px;
            color: var(--secondary-text-color);
          }
          input, textarea, select {
            width: 100%;
            padding: 8px;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.14);
            background: rgba(17,24,39,0.55);
            color: var(--primary-text-color);
            font-size: 12px;
            box-sizing: border-box;
          }
          textarea {
            min-height: 46px;
            resize: vertical;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
          }
          textarea.positions-json {
            min-height: 180px;
          }
          details.position-json-details summary {
            cursor: pointer;
            color: var(--secondary-text-color);
            font-size: 12px;
            padding: 4px 0;
          }
          .position-actions {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .position-open-button,
          .position-close-button {
            border: 1px solid rgba(255,255,255,0.16);
            background: rgba(14,165,233,0.18);
            color: var(--primary-text-color);
            border-radius: 8px;
            padding: 9px 12px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 700;
          }
          .position-editor-modal {
            position: fixed;
            inset: 16px;
            z-index: 1000;
            display: grid;
            place-items: center;
            background: rgba(2,6,23,0.72);
            backdrop-filter: blur(10px);
          }
          .position-editor-panel {
            width: 100%;
            max-width: min(1180px, calc(100vw - 32px));
            max-height: calc(100vh - 32px);
            min-width: 0;
            overflow: hidden;
            box-sizing: border-box;
            border: 1px solid rgba(255,255,255,0.16);
            border-radius: 10px;
            background: #0b1120;
            box-shadow: 0 24px 80px rgba(0,0,0,0.5);
            padding: 14px;
            display: grid;
            grid-template-rows: auto minmax(0, 1fr);
            gap: 12px;
          }
          .position-editor-header {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            align-items: center;
          }
          .position-editor-header h3 {
            margin: 0;
            font-size: 18px;
          }
          .position-editor-title-row {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
          }
          .position-editor-kicker {
            font-size: 11px;
            color: var(--secondary-text-color);
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          .position-editor-workspace {
            display: flex;
            flex-direction: column;
            gap: 12px;
            align-items: start;
            min-width: 0;
            min-height: 0;
            overflow: auto;
          }
          .position-editor-workspace > label,
          .position-editor-workspace > select {
            width: 100%;
          }
          .position-groups-modal {
            max-height: none;
            overflow: visible;
            width: 100%;
            box-sizing: border-box;
            border-radius: 8px;
            background: #0b1120;
            padding: 4px 0 0;
            min-width: 0;
          }
          @media (max-width: 900px) {
            .position-editor-modal {
              inset: 6px;
            }
            .position-editor-panel {
              width: calc(100vw - 12px);
              max-height: calc(100vh - 12px);
              padding: 10px;
            }
            .position-editor-workspace {
              gap: 10px;
            }
            .position-groups-modal {
              max-height: none;
            }
            .position-pair-grid {
              grid-template-columns: minmax(0, 1fr);
            }
          }
          .position-groups {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 10px;
            min-width: 0;
          }
          .position-preview-frame {
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 8px;
            overflow: hidden;
            background: #020617;
            width: 100%;
            flex: 0 0 auto;
            box-sizing: border-box;
            min-width: 0;
          }
          .position-preview-svg {
            display: block;
            width: 100%;
            height: auto;
            touch-action: none;
            user-select: none;
          }
          .position-preview-dim {
            fill: #020817;
            opacity: 0.42;
          }
          .position-preview-guide {
            stroke: rgba(226,232,240,0.78);
            stroke-width: 1.5;
            stroke-linecap: round;
            pointer-events: none;
          }
          .position-preview-label,
          .position-preview-power {
            fill: #f8fafc;
            text-anchor: middle;
            paint-order: stroke;
            stroke: rgba(2,6,23,0.8);
            stroke-width: 3px;
            stroke-linejoin: round;
            pointer-events: none;
          }
          .position-preview-label {
            font-size: 13px;
            font-weight: 800;
            letter-spacing: 0.08em;
            opacity: 0.78;
          }
          .position-preview-power {
            font-size: 18px;
            font-weight: 800;
          }
          .position-preview-text,
          .position-guide-handle {
            cursor: grab;
          }
          .position-preview-svg.is-dragging .position-preview-text,
          .position-preview-svg.is-dragging .position-guide-handle {
            cursor: grabbing;
          }
          .position-text-grip,
          .position-guide-handle {
            fill: rgba(14,165,233,0.86);
            stroke: rgba(248,250,252,0.94);
            stroke-width: 2;
            filter: drop-shadow(0 2px 6px rgba(2,6,23,0.45));
          }
          .position-text-grip {
            fill: rgba(34,197,94,0.88);
          }
          .position-group {
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 8px;
            padding: 10px;
            display: grid;
            gap: 8px;
            position: relative;
            z-index: 1;
            background: #0b1120;
            min-width: 0;
          }
          .position-title {
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--primary-text-color);
          }
          .position-pair-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
            gap: 6px 8px;
          }
          .position-pair-row {
            display: grid;
            grid-template-columns: minmax(58px, auto) minmax(0, 1fr) minmax(0, 1fr);
            align-items: center;
            gap: 6px;
            min-width: 0;
          }
          .position-pair-title {
            color: var(--secondary-text-color);
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
          }
          .position-axis-field {
            display: grid;
            grid-template-columns: auto minmax(0, 1fr);
            gap: 4px;
            align-items: center;
            min-width: 0;
          }
          .position-axis-field span {
            color: var(--secondary-text-color);
            font-size: 10px;
            font-weight: 700;
          }
          .position-axis-field input {
            padding: 6px 7px;
            min-width: 0;
            font-size: 12px;
          }
          .position-field {
            display: grid;
            min-width: 0;
          }
          .row {
            display: grid;
            grid-template-columns: 1fr 42px;
            gap: 8px;
            align-items: center;
            min-height: 36px;
          }
          .row label {
            font-size: 13px;
            font-weight: 500;
          }
          input[type="checkbox"] {
            width: 24px;
            height: 24px;
            margin: 0;
            justify-self: end;
            accent-color: var(--primary-color);
            cursor: pointer;
          }
          .hint {
            font-size: 11px;
            color: var(--secondary-text-color);
            opacity: 0.85;
          }
          select {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
          }
          .entity-picker,
          .entity-select {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
          }
        </style>
        <div class="wrap">
          <div class="block">
            <h4>${this._t('editor.section_general', 'General')}</h4>
            <div class="grid">
              <label>${this._t('editor.field_title', 'Title')}</label>
              <input data-path="title" value="${cfg.title || ''}">
              ${this._languageSelectRow()}
              <label>${this._t('editor.field_background', 'Background URL')}</label>
              <input data-path="background" value="${cfg.background || ''}">
              <label>${this._t('editor.field_background_base', 'Background Assets Base (auto)')}</label>
              <input data-path="background_asset_base" value="${cfg.background_asset_base || '/local/community/tesla-style-energy-flow/backgrounds'}">
              ${this._powerUnitModeRow()}
              <div class="row">
                <label>${this._t('editor.field_grid_invert', 'Invert grid sign')}</label>
                <input type="checkbox" data-path="grid_invert" ${cfg.grid_invert ? 'checked' : ''}>
              </div>
              <div class="row">
                <label>Invert battery sign</label>
                <input type="checkbox" data-path="battery_invert" ${cfg.battery_invert ? 'checked' : ''}>
              </div>
              <div class="row">
                <label>Show header</label>
                <input type="checkbox" data-path="show_header" ${cfg.show_header !== false ? 'checked' : ''}>
              </div>
              <div class="row">
                <label>${this._t('editor.field_show_labels', 'Show labels')}</label>
                <input type="checkbox" data-path="show_labels" ${cfg.show_labels ? 'checked' : ''}>
              </div>
              <div class="row">
                <label>${this._t('editor.field_hide_ev_idle', 'Hide EV when idle')}</label>
                <input type="checkbox" data-path="ev_hide_when_idle" ${cfg.ev_hide_when_idle ? 'checked' : ''}>
              </div>
              <label>${this._t('editor.field_scene_scale', 'Scene Scale')}</label>
              <input type="number" step="0.01" data-path="scene_scale" value="${safeNum(cfg.scene_scale, 1)}">
              <label>Font scale</label>
              <input type="number" step="0.05" min="0.75" max="1.35" data-path="font_scale" value="${safeNum(cfg.font_scale, 1)}">
              <label>EV 1 label</label>
              <input data-path="ev_label" value="${this._escapeHtml(cfg.ev_label || '')}">
              <label>EV 2 label</label>
              <input data-path="ev2_label" value="${this._escapeHtml(cfg.ev2_label || '')}">
              <label>Roof Array A label</label>
              <input data-path="roof_a_label" value="${this._escapeHtml(cfg.roof_a_label || 'ARRAY A')}">
              <label>Roof Array B label</label>
              <input data-path="roof_b_label" value="${this._escapeHtml(cfg.roof_b_label || 'ARRAY B')}">
              <label>${this._t('editor.field_solar_threshold', 'Solar threshold (W)')}</label>
              <input type="number" data-path="thresholds.solar_min_w" value="${safeNum(cfg.thresholds?.solar_min_w, 50)}">
              <label>${this._t('editor.field_grid_threshold', 'Grid threshold (W)')}</label>
              <input type="number" data-path="thresholds.grid_min_w" value="${safeNum(cfg.thresholds?.grid_min_w, 50)}">
              <label>${this._t('editor.field_battery_threshold', 'Battery threshold (W)')}</label>
              <input type="number" data-path="thresholds.battery_min_w" value="${safeNum(cfg.thresholds?.battery_min_w, 50)}">
              <label>EV threshold (W)</label>
              <input type="number" data-path="ev_min_w" value="${safeNum(cfg.ev_min_w, 150)}">
            </div>
          </div>

          <div class="block">
            <h4>${this._t('editor.section_sensors', 'Sensors')}</h4>
            <div class="grid">
              ${this._entitySelectRow(this._t('editor.sensor_solar', 'Solar Power'), 'entities.solar_power', sensorIds, this._t('editor.placeholder_sensor', '-- select sensor --'))}
              ${this._entitySelectRow('Roof Array A Power', 'entities.roof_a_power', sensorIds, this._t('editor.placeholder_sensor', '-- select sensor --'))}
              ${this._entitySelectRow('Roof Array A Voltage', 'entities.roof_a_voltage', sensorIds, this._t('editor.placeholder_sensor', '-- select sensor --'))}
              ${this._entitySelectRow('Roof Array A Current', 'entities.roof_a_current', sensorIds, this._t('editor.placeholder_sensor', '-- select sensor --'))}
              ${this._entitySelectRow('Roof Array B Power', 'entities.roof_b_power', sensorIds, this._t('editor.placeholder_sensor', '-- select sensor --'))}
              ${this._entitySelectRow('Roof Array B Voltage', 'entities.roof_b_voltage', sensorIds, this._t('editor.placeholder_sensor', '-- select sensor --'))}
              ${this._entitySelectRow('Roof Array B Current', 'entities.roof_b_current', sensorIds, this._t('editor.placeholder_sensor', '-- select sensor --'))}
              ${this._entitySelectRow(this._t('editor.sensor_grid', 'Grid Power'), 'entities.grid_power', sensorIds, this._t('editor.placeholder_sensor', '-- select sensor --'))}
              ${this._entitySelectRow(this._t('editor.sensor_battery', 'Battery Power'), 'entities.battery_power', sensorIds, this._t('editor.placeholder_sensor', '-- select sensor --'))}
              ${this._entitySelectRow(this._t('editor.sensor_battery_charge', 'Battery Charge Power'), 'entities.battery_charge_power', sensorIds, this._t('editor.placeholder_sensor', '-- select sensor --'))}
              ${this._entitySelectRow(this._t('editor.sensor_battery_discharge', 'Battery Discharge Power'), 'entities.battery_discharge_power', sensorIds, this._t('editor.placeholder_sensor', '-- select sensor --'))}
              ${this._entitySelectRow(this._t('editor.sensor_load', 'Load Power'), 'entities.load_power', sensorIds, this._t('editor.placeholder_sensor', '-- select sensor --'))}
              ${this._entitySelectRow(this._t('editor.sensor_battery_level', 'Battery Level %'), 'entities.battery_level', sensorIds, this._t('editor.placeholder_sensor', '-- select sensor --'))}
              ${this._entitySelectRow(this._t('editor.sensor_ev_power', 'EV Power'), 'entities.ev_power', sensorIds, this._t('editor.placeholder_sensor', '-- select sensor --'))}
              ${this._entitySelectRow(this._t('editor.sensor_ev_battery', 'EV Battery %'), 'entities.ev_battery', sensorIds, this._t('editor.placeholder_sensor', '-- select sensor --'))}
              ${this._entitySelectRow(this._t('editor.sensor_ev_switch', 'EV Charge Switch'), 'entities.ev_charge_switch', switchIds, this._t('editor.placeholder_switch', '-- select switch --'))}
              ${this._entitySelectRow('EV 1 Presence', 'entities.ev_presence', presenceIds, '-- select presence entity --')}
              ${this._entitySelectRow(this._t('editor.sensor_ev2_power', 'EV 2 Power'), 'entities.ev2_power', sensorIds, this._t('editor.placeholder_sensor', '-- select sensor --'))}
              ${this._entitySelectRow(this._t('editor.sensor_ev2_battery', 'EV 2 Battery %'), 'entities.ev2_battery', sensorIds, this._t('editor.placeholder_sensor', '-- select sensor --'))}
              ${this._entitySelectRow(this._t('editor.sensor_ev2_switch', 'EV 2 Charge Switch'), 'entities.ev2_charge_switch', switchIds, this._t('editor.placeholder_switch', '-- select switch --'))}
              ${this._entitySelectRow('EV 2 Presence', 'entities.ev2_presence', presenceIds, '-- select presence entity --')}
              ${this._entitySelectRow(this._t('editor.sensor_weather', 'Weather Entity'), 'entities.weather', weatherIds, this._t('editor.placeholder_weather', '-- select weather --'))}
              ${this._entitySelectRow(this._t('editor.sensor_sun', 'Sun Entity'), 'entities.sun', sunIds, this._t('editor.placeholder_sun', '-- select sun --'))}
            </div>
            <div class="hint">${this._t('editor.hint_entities', 'Clean menu with domain-filtered entities.')}</div>
          </div>

          <div class="block">
            <h4>${this._t('editor.section_dynamic_bg', 'Dynamic Background')}</h4>
            <div class="grid">
              <div class="row">
                <label>${this._t('editor.field_dynamic_bg', 'Enable dynamic')}</label>
                <input type="checkbox" data-path="dynamic_background" ${cfg.dynamic_background ? 'checked' : ''}>
              </div>
              <label>background_map.default</label>
              <input data-path="background_map.default" value="${b.default || ''}">
              <label>background_map.day_default</label>
              <input data-path="background_map.day_default" value="${b.day_default || ''}">
              <label>background_map.night_default</label>
              <input data-path="background_map.night_default" value="${b.night_default || ''}">
              <label>background_map.morning_default</label>
              <input data-path="background_map.morning_default" value="${b.morning_default || ''}">
              <label>background_map.afternoon_default</label>
              <input data-path="background_map.afternoon_default" value="${b.afternoon_default || ''}">
              <label>background_map.evening_default</label>
              <input data-path="background_map.evening_default" value="${b.evening_default || ''}">
              <label>background_map.day_clear</label>
              <input data-path="background_map.day_clear" value="${b.day_clear || ''}">
              <label>background_map.day_cloudy</label>
              <input data-path="background_map.day_cloudy" value="${b.day_cloudy || ''}">
              <label>background_map.day_rain</label>
              <input data-path="background_map.day_rain" value="${b.day_rain || ''}">
              <label>background_map.night_clear</label>
              <input data-path="background_map.night_clear" value="${b.night_clear || ''}">
              <label>background_map.night_cloudy</label>
              <input data-path="background_map.night_cloudy" value="${b.night_cloudy || ''}">
              <label>background_map.night_rain</label>
              <input data-path="background_map.night_rain" value="${b.night_rain || ''}">
              <label>background_map.day_clear_idle</label>
              <input data-path="background_map.day_clear_idle" value="${b.day_clear_idle || ''}">
              <label>background_map.day_clear_charging</label>
              <input data-path="background_map.day_clear_charging" value="${b.day_clear_charging || ''}">
              <label>background_map.morning_clear_idle</label>
              <input data-path="background_map.morning_clear_idle" value="${b.morning_clear_idle || ''}">
              <label>background_map.morning_clear_charging</label>
              <input data-path="background_map.morning_clear_charging" value="${b.morning_clear_charging || ''}">
              <label>background_map.afternoon_clear_idle</label>
              <input data-path="background_map.afternoon_clear_idle" value="${b.afternoon_clear_idle || ''}">
              <label>background_map.afternoon_clear_charging</label>
              <input data-path="background_map.afternoon_clear_charging" value="${b.afternoon_clear_charging || ''}">
              <label>background_map.evening_clear_idle</label>
              <input data-path="background_map.evening_clear_idle" value="${b.evening_clear_idle || ''}">
              <label>background_map.evening_clear_charging</label>
              <input data-path="background_map.evening_clear_charging" value="${b.evening_clear_charging || ''}">
              <label>background_map.night_clear_idle</label>
              <input data-path="background_map.night_clear_idle" value="${b.night_clear_idle || ''}">
              <label>background_map.night_clear_charging</label>
              <input data-path="background_map.night_clear_charging" value="${b.night_clear_charging || ''}">
            </div>
            <div class="hint">${this._t('editor.hint_bg_lookup', 'Lookup priority: period+weather+charging -> period+weather -> period_default -> default -> background.')}</div>
          </div>

          <div class="block">
            <h4>${this._t('editor.section_scene_positions', 'Scene positions')}</h4>
            <div class="grid">
              <div class="position-actions">
                <button type="button" class="position-open-button" data-open-position-editor>${this._t('editor.position_open_button', 'Edit visually')}</button>
              </div>
              <details class="position-json-details">
                <summary>scene_component_map JSON</summary>
                <textarea class="positions-json" data-json-path="scene_component_map" data-commit="change" spellcheck="false">${this._escapeHtml(this._jsonString('scene_component_map'))}</textarea>
              </details>
            </div>
            <div class="hint">${this._t('editor.position_hint', 'Battery percent follows the battery kW value automatically. Path geometry stays in YAML/JSON.')}</div>
          </div>
          ${this._positionEditorModal()}
        </div>
      `;

      this.shadowRoot.querySelectorAll('button[data-open-position-editor]').forEach((button) => {
        button.addEventListener('click', () => {
          this._positionEditorOpen = true;
          this._render();
        });
      });

      this.shadowRoot.querySelectorAll('button[data-close-position-editor]').forEach((button) => {
        button.addEventListener('click', () => {
          this._flushEditorUpdate();
          this._positionEditorOpen = false;
          this._render();
        });
      });

      this.shadowRoot.querySelectorAll('select[data-position-scene]').forEach((positionSceneSelect) => {
        positionSceneSelect.addEventListener('focus', () => {
          this._editingPath = 'position-scene';
        });
        positionSceneSelect.addEventListener('change', () => {
          this._flushEditorUpdate();
          this._positionSceneKey = positionSceneSelect.value;
          this._editingPath = '';
          this._render();
        });
        positionSceneSelect.addEventListener('blur', () => {
          this._editingPath = '';
        });
      });

      this.shadowRoot.querySelectorAll('svg[data-position-preview-svg]').forEach((positionPreviewSvg) => {
        positionPreviewSvg.addEventListener('pointerdown', (event) => this._beginPositionDrag(event));
        positionPreviewSvg.addEventListener('pointermove', (event) => this._movePositionDrag(event));
        positionPreviewSvg.addEventListener('pointerup', (event) => this._endPositionDrag(event));
        positionPreviewSvg.addEventListener('pointercancel', (event) => this._endPositionDrag(event));
      });

      this.shadowRoot.querySelectorAll('input[data-position-path]').forEach((el) => {
        const path = el.dataset.positionPath;
        el.addEventListener('focus', () => {
          this._editingPath = `position:${path}`;
        });
        el.addEventListener('input', () => {
          const change = {
            componentKey: el.dataset.positionComponent,
            attr: el.dataset.positionAttr,
            value: safeNum(el.value, 0)
          };
          const changes = this._positionLinkedChanges(
            el.dataset.positionSceneKey,
            change.componentKey,
            change.attr,
            change.value
          );
          this._queueScenePositionChanges(el.dataset.positionSceneKey, changes);
          this._updatePositionPreviewDom(el.dataset.positionSceneKey, changes);
        });
        el.addEventListener('blur', () => {
          this._editingPath = '';
          this._flushEditorUpdate();
        });
      });

      this.shadowRoot.querySelectorAll('input, select, textarea').forEach((el) => {
        if (el.dataset.jsonPath) return;
        if (el.dataset.positionPath || el.dataset.positionScene !== undefined) return;
        const path = el.dataset.path;
        if (!path) return;
        const eventName = this._editorCommitEvent(el);
        const readValue = () => {
          if (el.type === 'checkbox') {
            return el.checked;
          }
          if (el.type === 'number') {
            return safeNum(el.value, 0);
          }
          return el.value;
        };
        el.addEventListener('focus', () => {
          this._editingPath = path;
        });
        el.addEventListener('blur', () => {
          this._editingPath = '';
          this._flushEditorUpdate();
        });
        el.addEventListener(eventName, () => {
          if (eventName === 'input') {
            this._queueEditorUpdate(path, readValue());
          } else {
            this._update(path, readValue());
          }
        });
      });

      this.shadowRoot.querySelectorAll('textarea[data-json-path]').forEach((el) => {
        const path = el.dataset.jsonPath;
        if (!path) return;
        el.addEventListener('focus', () => {
          this._editingPath = `json:${path}`;
        });
        el.addEventListener('blur', () => {
          this._editingPath = '';
        });
        el.addEventListener('change', () => {
          const ok = this._updateJson(path, el.value);
          if (typeof el.setCustomValidity === 'function') {
            el.setCustomValidity(ok ? '' : 'Invalid JSON');
            el.reportValidity();
          }
        });
      });
    }
  }

  if (!customElements.get(CARD_TYPE)) {
    customElements.define(CARD_TYPE, EnergyFlowProCard);
  }
  if (!customElements.get('tesla-style-energy-flow-editor')) {
    customElements.define('tesla-style-energy-flow-editor', EnergyFlowProCardEditor);
  }

  window.customCards = window.customCards || [];
  if (!window.customCards.find((c) => c.type === CARD_TYPE)) {
    window.customCards.push({
      type: CARD_TYPE,
      name: 'Tesla Style Energy Flow',
      description: 'Flow card with background, configurable entities, and color logic.'
    });
  }
})();
