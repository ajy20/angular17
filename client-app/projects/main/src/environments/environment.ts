export const environment = {
  production: true,

  baseUrl: 'https://localhost:44321/api/v1/',

  basePLMUrl:'',

  memoizeTimeOut: 50000,

  msalConfig: {
    auth: {
      clientId: '', // This is the Id of the application registration on Azure Portal
      authority: '', // This is the Id of the Azure directory
      redirectUri: 'http://localhost:4200',// This is your redirect URI
      postLogoutRedirectUri: 'http://localhost:4200'// This is your redirect URI after log out
    }
  },

  apiConfig:  {
    scopes: [],
    uri: 'https://localhost:44321/'
  },
  graphConfig: {
    scopes: ['user.read'],
    uri: 'https://graph.microsoft.com/'
  }
};
