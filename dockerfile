# Dockerfile
FROM node:20-alpine

# Diretório de trabalho
WORKDIR /app

# Ferramentas de build para dependências nativas (bcrypt)
RUN apk add --no-cache python3 make g++

# Copia apenas package.json e package-lock.json
COPY package*.json ./

# Instala dependências dentro do container (Linux)
RUN npm install

# Copia o restante do projeto
COPY . .

# Build TypeScript
RUN npm run build

# Expõe porta do Node
EXPOSE 3000

# Comando padrão
CMD ["npm", "run", "dev"]
