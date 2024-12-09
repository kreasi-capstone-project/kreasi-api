# API Design

## Login
### POST Request
- Endpoint `/api/signin`
- Header: 
	- `Content-Type: application/json`
- Body:
```json
{
	"email": string
	"password": string
}
```
### Response
#### 200 ( Success )
- Header:
	- `Content-Type: application/json`
- Body:
```json
{
	"status": "success",
	"data": {
		"users": {
			"id": number
			"email": string
			"name": string
		},
		"token": string
	}
}
```
#### 400 ( Bad Request - Validation Error)
- Header
	- `Content-Type: application/json`
- Body:
```json
{
	"status": "fail",
	"errors": {
		"code": 400,
		"message": "validation error",
		"details": {
			"email": "invalid email format"
		}
	}
}
```
#### 400 ( Bad Request - email or password wrong )
- Header
	- `Content-Type: application/json`
- Body:
```json
{
	"status": "fail",
	"errors": {
		"code": 400,
		"message": "login fail, email or password is incorrect"
	}
}
```
#### 500 ( Server Error )
- Header
	- `Content-Type: application/json`
- Body
```json
 {
	"status": "fail",
	"errors": {
		"code": 500,
		"message": "login fail, this is not your fault, our team will investigate this. please try again later"
	}
}
```
## POST Register
### Request
- Endpoint: `/api/register`
- Header:
	- `Content-Type: application/json`
- Body
```json
{
	"name": string,
	"email": string,
	"password": string
}
```
### Response
#### 201 ( Created / Successfully create new account )
- Header:
	- `Content-Type: application/json`
- Body
```json
{
	"status": "success",
	"data": {
		"users": {
			"id": number
			"email": string
		},
		"token": string
	}
}
```
#### 400 ( Bad Request - Validation Error)
- Header
	- `Content-Type: application/json`
- Body:
```json
{
	"status": "fail",
	"errors": {
		"code": 400,
		"message": "validation error",
		"details": {
			"email": "invalid email format",
			"name": "name should not be empty",
			"password": "password should have 6 minimum characters"
		}
	}
}
```
#### 400 ( Bad Request - account already exists )
- Header
	- `Content-Type: application/json`
- Body:
```json
{
	"status": "fail",
	"errors": {
		"code": 400,
		"message": "this account already exist, maybe you should login instead",
	}
}
```
#### 500 ( Server Error )

- Header
	- `Content-Type: application/json`
- Body
```json
 {
	"status": "fail",
	"errors": {
		"code": 500,
		"message": "register fail, this is not your fault, our team will investigate this. please try again later"
	}
}
```
## DELETE Logout
### Request
- Endpoint: `/api/logout`

### Response
#### 204 (Success)
return no content
#### 400 (Request failed, it's most likely because request is malformed)
- Header:
	- `Content-Type: application/json`
- Body:
```json
{
	"status": "fail",
	"errors": {
		"code": 400,
		"message": "fail to logout, user not exist" 
	}
}
```
#### 500 (Request failed, server unavailable because it crash)
- Header:
	- `Content-Type: application/json`
- Body:
```json
{
	"status": "fail",
	"errors": {
		"code": 500,
		"message": "This is not your fault, our team is working to fix this issue, please try again later
" 
	}
}
```
## GET All Learning Path
### Request
- Endpoint: `/api/subjects`
- Header:
	- `Authorization: Bearer [token]`
### Response
#### 200 ( Success )
- Header:
	- `Content-Type: application/json`
- Body:
```json
{
	"status": "success",
	"data": {
		"subjects": 
		[
			{
				"id": 1,
				"name": "Machine Learning",
				"description": "Lorem Ipsum is simply dummy text of the printing and typesetting industry"
			},
			{
				"id": 2,
				"name": "Mobile Development with Kotlin",
				"description": "Lorem Ipsum is simply dummy text of the printing and typesetting industry"
			}
		]
	}
}
```
#### 200 ( Success - Empty Learning Path )
- Header:
	- `Content-Type: application/json`
- Body:
```json
{
	"status": "success",
	"data": {
		"subjects": []
	}
}
```

## GET One Learning Path By ID
### Request
- Endpoint: `/api/subjects/:id`
- Param:
	- id: number
		- description: learning path ID
- Header:
	- `Authorization: Bearer [token]`
### Response
#### 200 ( Success - Learning Path Found )
- Header:
	- `Content-Type: application/json`
- Body:
```json
{
	"status": "success",
	"data": {
		"subjects": {
			"name": "Machine Learning",
			"description": "Lorem Ipsum is simply dummy text of the printing and typesetting industry"
		}
	}
}
```
#### 404 ( Success - Learning Path Not Found )
- Header:
	- `Content-Type: application/json`
- Body:
```json
{
	"status": "fail",
	"errors": {
		"code": 404,
		"message": "learning path with that specified id is not found"
	}
}
```
## GET Assessment Test
### Request
- Endpoint: `/api/subjects/:id/assessments`
- Param:
	- id: number
		- description: learning path ID
- Header:
	- `Authorization: Bearer [token]`

### Response
#### 200 ( Success )
- Header:
	- `Content-Type: application/json`
- Body:
```json
{
	"status": "success",
	"data": {
		"subjects": {
			"id": 1
			"name": "Machine Learning"
		},
		"assessments": {
			"question example 1": {
				"answers": [
					"multiple choice 1",
					"multiple choice 2",
					"multiple choice 3",
				],
				"correct_answers": "multiple choice 3"
			},
			"question example 2": {
				"answers": [
					"multiple choice 1",
					"multiple choice 2",
					"multiple choice 3",
				],
				"correct_answers": "multiple choice 1"
			}
		}
	}
}
```

### POST Test Result
#### Request
- Endpoint: `/api/subjects/:id/assessments`
- Header:
	- `Content-Type: application/json`
	- `Authorization: Bearer [token]`
- Body
```json
{
	"subject_id": 1,
	"correct_answer": 4
}
```
### Response
#### 200 ( Success get recommendation path by AI )
- Header:
	- `Content-Type: application/json`
- Body
```json
{
	"status": "success",
	"data": {
		"assessment":{
			"level": "beginner"
		},
		"subjects": {
			"name": "Machine Learning",
			"recommended_path": {
				"Pemahaman Dasar Pemrograman dan Matematika": [
					"Pemrograman Dasar(Python, R)",
					"Matematika(Linear Algebra, Kalkulus, Statistik dan Probabilitas)"
				],
				"Data Handling dan Explorasi": [
					"Pelajaran 1",
					"Pelajaran 2"
				]
			},
		}
	}
}
```
