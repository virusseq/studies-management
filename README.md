# studies-service

Simple app that batches requests to song+ego to fetch and create studies along with related autho entities (ego groups and policies). This app also batches requests to ego add users to a study group.

## Dev local env setup

There is a docker compose setup with ego, song, and their respective DBs with some initial values provided in `./compose`.

Start containers:

```
cd compose
docker-compose up -d
```

Start app:

```
npm run dev
```

<br>

### Default that song and ego DBs are init with:

Default Studies:

```
DASH-CA
COVID-PR
TEST-CA
```

Default users:

```
submitter1@example.com
submitter2@example.com
submitter3@example.com
submitter4@example.com
submitter5@example.com
submitter6@example.com
```
