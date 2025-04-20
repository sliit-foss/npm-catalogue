shx cp ../../.babelrc ../../jest.config.ts . && dotenv -- jest --coverage --verbose --runInBand --detectOpenHandles --forceExit && rimraf .babelrc jest.config.ts
