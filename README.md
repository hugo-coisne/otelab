# OTELAB
###### by Coisne Hugo and Léo Saintier

## Requirements
- Docker

### Start main services
```docker compose --profile main up -d --force-recreate --remove-orphans```

### Start k6 load test
```docker compose --profile k6 up -d --force-recreate --remove-orphans```