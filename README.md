# Red Matter v2.0 Frontend

This version of the app is the flagship of Red Matter's company.

The basic objective of this project is to make it as simple as possible to do Flow Cytometry, focusing on making it easier for beginners. Here's the decision guidelines for any feature:
- Is it fast?
- Is it simple?
- Is it slick?
- Is it pretty?
- Is the user's goal accomplished?

## How to setup?

You can clone this repository with:
```
git clone https://github.com/RedMatterApplication/RedMatterAppFrontend
```
*Authentication is required*

Then install dependencies:
```bash
npm install
# or
yarn install
```

You are ready to go!

## How to run?

You can run the server by typing
```
npm run start:[env]
```

There are 4 environments:
- Local: Connected to you local backend service. If it's not up, it's not going to work properly. Should be on port 8080.
- Development: Connected to development backend in the cloud.
- Staging: Connected to homologation backend in the cloud.
- Production: **[be careful]** connected to production environment in the cloud.

If you want to use the localhost for the app you can run:
```
npm run start:local
```

If you want to use the cloud development backend:
```
npm run start:dev
```
