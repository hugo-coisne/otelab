# OTELAB
###### by Coisne Hugo and Léo Saintier

## Requirements
- Docker
- Building service images : ```docker build -t otelab-service-a src/service/.``` and ```docker build -t otelab-service-b src/service-b/.```

### Start main services (from project root directory)
```docker compose --profile main up -d --force-recreate --remove-orphans```

### Start k6 load test
```docker compose --profile k6 up -d --force-recreate --remove-orphans```