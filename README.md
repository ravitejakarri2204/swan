# Project-Swan
## Grocery Application

## Features

- Signin/Signup Implemented for *client & admin*
- Add Products by admin only
- Client can add review to an existing product
- Client can search on products ($regex matching only)

## Assumptions

- Validation checks are not implemented on every input so we assumed a valid user is using this application.
- No validations on the csv file.
- Token is validated but not the user.

## Prerequisite


| Plugin | README |
| ------ | ------ |
| Node | v12.21.0 |
| Mongo | v4.2.9 |

## Installation

Install the dependencies and devDependencies and start the server.

```sh
npm install
```

## Start

By default the server was to run on 3000 port.

```sh
npm start
```

## Swagger Route

```sh
/api-docs
```


