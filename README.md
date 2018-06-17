# Todo List 

Réalisée dans le cadre d'un cours de **Node JS**, cette application a eu pour but d'apprendre à utiliser le framework **Express Js**, le moteur de template **Pug** et la création d'un site / API en _Node JS_.

Mise à part les pages de connexion et d'inscription, toutes les routes sont protégées et nécessittent une connexion. Pour chaque route, elle renvoi des formats _HTML_ et _JSON_ pour gérer des utilisateurs et leurs todos.   

## Installation 

Cette application nécessite d'avoir nodeJs d'installé.

```bash
git clone https://github.com/remi95/TodoList-NodeJS.git
npm install 
node app.js
```

## Utilisation

### Routes

Voici la liste des routes de l'application.   
Je vous donne les indications sur ce qu'elles renvoient en Json, et vous laisse découvrir par vous même en HTML. 

| Route | Méthode | Protégée | Retour |
| --- | --- | --- | --- |
| / | GET | Non | Redirige sur _/todos_
| /login | GET | Non | Demande un _email et password_ connu
| /login | POST | Non | **x-access-token**
| /logout | GET | Oui | Efface le _token_
| /users/ | GET | Oui | Liste des utilisateurs
| /users/:id | GET | Oui | L'utilisateur correspondant à l'id
| /users/add | GET | Non | Demande _pseudo, email, password, firstname, lastname_
| /users/ | POST | Non | Ajoute, redirige sur _/users_
| /users/edit/:id | GET | Oui | Demande _pseudo, email, firstname, lastname_
| /users/:id | PUT | Oui | Modifie, redirige sur _/users/:id_
| /users/:id | DELETE | Oui | Supprime, redirige sur _/users_
| /todos/ | GET | Oui | Liste des Todos de l'utilisateur correpondant au token en cours
| /todos/add | GET | Oui | Demande un _message_
| /todos/ | POST | Oui | Ajoute, redirige sur _/todos_
| /todos/edit/:id | GET | Oui | Demande un _message_
| /todos/:id | PUT | Oui | Modifie, redirige sur _/todos_
| /todos/:id | DELETE | Oui | Supprime, redirige sur _/todos_

### Authentification 

Pour accéder aux routes protégées, il faut tout d'abord créer un utilisateur (_/users/add_).   
Ensuite, en se connectant, on obtient un **access-token** qui sera utilisé pour l'authentification.    
En HTML, pas besoin de s'en préoccuper. En _Json_ en revanche, pensez bien à mettre dans vos headers :
`x-access-token: your-awesome-token`