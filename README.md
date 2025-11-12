# ExZodOs

ExZodOs provides a type-safe Axios client wrapper and an Express router with auto-completion features backed by [Zod](https://github.com/colinhacks/zod) schemas. This project is heavily inspired by the [Zodios](https://www.zodios.org) project.

## Why ExZodOs?

Most of the end-to-end type-safe innovations like [tRPC](https://trpc.io/) and [Hono](https://hono.dev/) are built around code-first approach and custom solutions. But what if you want to manage your project with schema-first approach and code generation, with a widely used standard like [OpenAPI](https://www.openapis.org/).

ExZodUs tries provide an end-to-end type-safe solution which require little to no project structure changes at all.

## Who can use ExZodOs?

Any development team which already uses [Express](https://expressjs.com/) and [Axios](https://axios-http.com/) for their client-server communication.

## How to use?

### 1. Installation
```bash
npm i @assassinonz/exzodos-router;
npm i @assassinonz/exzodos-client;
```

### 2. Schema definition
- Write your API using [Zod](https://zod.dev/) types or find a generator that can do this automatically.

- Format your API to match the following TypeScript type definition.
```typescript
type Path = string;
type Method = string;
type Api = Record<Path, Record<Method, {
    request: {
        path: z.ZodType | undefined;
        query: z.ZodType | undefined;
        body: z.ZodType | undefined;
        header: z.ZodType | undefined;
    };
    response: Record<number | "default", z.ZodType | undefined>;
}>>;
```

- An example schema looks as follows.
```typescript
export const api = {
    "/users/:id": {
        get: {
            request: {
                path: z.object({ "id": z.coerce.number.int() }),
                query: undefined,
                body: undefined,
                header: undefined
            },
            response: {
                200: z.object({ "id": z.number.int(),  "name": z.string() }),
                404: z.object({ "message": z.string() })
                default: z.object({ "id": z.number.int(),  "name": z.string() })
            }
        },
    }
}
```

### 3. Using ExZodOsRouter

```typescript
import { api } from "./api.ts";
import { express, ExZodOsRouter } from "@assassinonz/exzodus-router";

//Define extras if modification of request type is needed
type Extras = {
    ctx?: {
        userId: number;
    }
}

//                                Zod based API schema
//                                        ▼
const router = ExZodOsRouter.new<typeof api, Extras>(api, {
    //Provide error handler for Zod errors
    errorHandler: (err, req, res) => {
        //TODO: Handle errors
    },

    //Disable request body validation when not dealing with JSON request bodies
    skipRequestBodyValidation: false,

    //Enable response validation on development environments
    attachResponseValidator: true
});


//  auto-complete path  fully typed and validated request params (body, query, params)
//             ▼           ▼    ▼
router.get("/users/:id", (req, res) => {
    if (req.ctx === undefined) {
        //Allows only documented response codes
        //Response is typed from the body of 404 response
        //                 ▼
        return res.status(404).json({
            message: "Please login first"
        });
    } else {
        const user = findUserById(req.ctx.userId);

        //Response is typed from the body of 200 response
        //                 ▼
        return res.status(200).json({
            id: user.id,
            name: user.name
        });
    }

});


const app = express();
app.use(express.json());
app.use("/api/v1", router);
```
### 4. Using ExZodusClient
Calling this API is now easy and has builtin autocomplete features :  
  
```typescript
import type { api } from "./api.ts";
import { ExZodOsClient } from "@assassinonz/exzodos-client";


//                               Zod based API schema
//                                        ▼
const client = new ExZodOsClient<typeof paths>("http://localhost:8080/api/v1");


//          typed                auto-complete path   auto-complete params
//            ▼                           ▼                   ▼
const userResponse = await client.get("/users/:id", { path: { id: 7 } });
console.log(userResponse.data);
```

### 5. Output
This should output the following.
```typescript
{
    id: 7,
    name: "John Doe"
}
```