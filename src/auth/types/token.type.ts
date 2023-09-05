export type JwtPayload = {
    email: string;
    createdAt: Date;
    issuer: 'Team Sparta - MoaPick';
    type: 'ACCESS' | 'REFRESH';
  };
  
  