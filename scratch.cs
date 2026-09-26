using System;
using System.IdentityModel.Tokens.Jwt;

var handler = new JwtSecurityTokenHandler();
var token = handler.ReadJwtToken(args[0]);
Console.WriteLine(token.ToString());
