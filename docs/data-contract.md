# Contrato de datos previsto

Este documento define la frontera inicial entre el frontend, el recolector de datos y el futuro motor de valoración. No representa un esquema definitivo ni autoriza el uso de una fuente.

## Principios

- Conservar procedencia, licencia, fecha de observación y reglas de retención junto a cada dato.
- Separar el anuncio observado, la identidad normalizada del vehículo y el resultado comercial.
- No sobrescribir precios: cada cambio crea una observación longitudinal.
- Distinguir valores observados, inferidos, estimados y verificados.
- Versionar entradas, modelos, metodología y resultados para poder reproducir una recomendación.
- Aislar los datos por organización y aplicar acceso por roles en el terminal profesional.

## Entidades mínimas

### `source`

- `source_id`
- `name`
- `source_type`: marketplace, distribuidor, fuente pública, inspección o integración
- `license_basis`
- `collection_method`
- `retention_policy`
- `active_from` / `active_to`

### `vehicle_identity`

- `vehicle_id`
- `normalized_make_id`
- `normalized_model_id`
- `normalized_version_id`
- `model_year`
- `body_type`
- `fuel_type`
- `transmission`
- `identity_confidence`
- `normalization_version`

La patente o VIN debe almacenarse por separado con controles reforzados, cifrado, finalidad y retención explícitas.

### `listing`

- `listing_id`
- `source_id`
- `source_reference`
- `vehicle_id`
- `seller_type`
- `region_code`
- `first_seen_at`
- `last_seen_at`
- `removed_at`
- `removal_reason`

### `listing_snapshot`

- `snapshot_id`
- `listing_id`
- `observed_at`
- `asking_price_clp`
- `mileage_km`
- `condition_claims`
- `raw_payload_reference`
- `content_hash`
- `verification_status`

### `dealer_transaction`

- `transaction_id`
- `organization_id`
- `vehicle_id`
- `acquired_at` / `listed_at` / `sold_at`
- `acquisition_price_clp`
- `preparation_cost_clp`
- `initial_asking_price_clp`
- `final_sale_price_clp`
- `financing_outcome`
- `warranty_outcome`
- `return_outcome`
- `recorded_by`
- `verification_status`

### `inspection`

- `inspection_id`
- `vehicle_id`
- `provider_id`
- `inspected_at`
- `findings`
- `estimated_repair_cost_clp`
- `evidence_references`
- `verification_status`

### `valuation_request`

- `request_id`
- `organization_id` opcional
- `input_method`: publicación, patente o filtros
- `input_reference`
- `consent_version`
- `purpose`
- `requested_at`

### `valuation_result`

- `analysis_id`
- `request_id`
- `model_version`
- `methodology_version`
- `generated_at`
- `fair_price_low_clp` / `fair_price_high_clp`
- `recommended_max_price_clp`
- `estimated_days_to_sale`
- `purchase_score`
- `confidence_level` / `confidence_score`
- `coverage_summary`
- `limitations`

Estados mínimos esperados del análisis:

- `queued` / `processing`: solicitud aceptada, todavía sin valores publicables.
- `estimated`: resultado disponible con metodología, versión y limitaciones.
- `insufficient_data`: no existe una muestra responsable; no se debe fabricar un rango.
- `source_unavailable`: la publicación no pudo leerse o ya no está disponible.
- `failed`: error recuperable del recolector o del motor.
- `verified`: resultado complementado con identidad o inspección verificadas.

### `valuation_comparable`

- `analysis_id`
- `listing_snapshot_id`
- `similarity_score`
- `included`
- `exclusion_reason`
- `mileage_adjustment_clp`
- `region_adjustment_clp`
- `version_adjustment_clp`
- `condition_adjustment_clp`

## Respuesta esperada por el frontend

El endpoint de análisis debería devolver en una sola respuesta el resultado, la explicación, los comparables y la información de confianza. El frontend no debe reconstruir ni inferir la metodología.

```json
{
  "analysis_id": "string",
  "status": "estimated",
  "generated_at": "ISO-8601",
  "vehicle": {},
  "valuation": {},
  "score": {},
  "confidence": {},
  "adjustments": [],
  "comparables": [],
  "coverage": {},
  "limitations": [],
  "source_disclosures": [],
  "next_actions": []
}
```

Los enlaces compartidos deben usar un identificador opaco con autorización de lectura y vencimiento. No deben incluir patente, VIN, correo, teléfono ni texto libre del usuario en la URL.

## Eventos de producto

Registrar como mínimo: solicitud iniciada, método de entrada, análisis completado, comparable abierto, análisis compartido, recomendación guardada, decisión registrada, inspección solicitada, compra, publicación, cambio de precio y venta. Los eventos no deben incluir patente, VIN o datos de contacto en texto libre.
