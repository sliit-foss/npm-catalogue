# @sliit-foss/mongoose-filter-query

### Middleware which implements a standardized format and maps an incoming http request's query params to a format which is supported by mongoose<br><br>

## Installation

```js
# using npm
npm install @sliit-foss/mongoose-filter-query

# using yarn
yarn add @sliit-foss/mongoose-filter-query
```

## Usage

```js
const { default: mongooseFilterQuery } = require("@sliit-foss/mongoose-filter-query");

// or

import mongooseFilterQuery from "@sliit-foss/mongoose-filter-query";

.....
.....

// in your express app

app.use(mongooseFilterQuery);


// while invoking your database query

const data = await Model.find(req.query.filter).sort(req.query.sort)

console.log(data);

// rest of your code

```

## Basic Usage Examples

```javascript
"http://localhost:3000/api/users?filter[first_name]=eq(John)";
```

- This will return all users with the first name John<br><br>

```javascript
"http://localhost:3000/api/users?filter[first_name]=ne(John)";
```

- This will return all users with the first name not equal to John<br><br>

```javascript
"http://localhost:3000/api/users?filter[first_name]=reg(Jo)";
```

- This will return all users with the first name matching the given regular expression<br><br>

```javascript
"http://localhost:3000/api/users?filter[age]=gt(20)";
```

- This will return all users with the age greater than 20<br><br>

```javascript
"http://localhost:3000/api/users?filter[age]=gte(20)";
```

- This will return all users with the age greater than or equal to 20<br><br>

```javascript
"http://localhost:3000/api/users?filter[age]=lt(20)";
```

- This will return all users with the age less than 20<br><br>

```javascript
"http://localhost:3000/api/users?filter[age]=lte(20)";
```

- This will return all users with the age less than or equal 20<br><br>

```javascript
"http://localhost:3000/api/users?filter[role]=in(staff,manager)";
```

- This will return all users with a user role of either staff or manager<br><br>

```javascript
"http://localhost:3000/api/users?filter[role]=nin(staff,manager)";
```

- This will return all users with a user role which is neither of staff and manager<br><br>

```javascript
"http://localhost:3000/api/users?filter[phone]=exists(true)";
```

- This will return all users who have the phone number attribute in their database record<br><br>

```javascript
"http://localhost:3000/api/users?filter[phone]=exists(false)";
```

- This will return all users who doesn't have the phone number attribute in their database record<br><br>

## Advanced Usage Examples

```javascript
"http://localhost:3000/api/users?filter[first_name]=or(eq(John),eq(Eric),reg(Kat))";
```

- This will return all users with a first name of John, Eric or matches the given regular expression<br><br>

```javascript
"http://localhost:3000/api/users?filter[age]=and(gt(20),lt(30))";
```

- This will return all users with an age which is between 20 and 30<br><br>

## Multiple Filters<br><br>

- Multiple filters can be chained together with the use of the & operator<br><br>

```javascript
"http://localhost:3000/api/users?filter[first_name]=eq(John)&filter[age]=gt(20)";
```

- This will return all users with the first name John and an age greater than 20<br><br>

## Sorting Support<br><br>

- Filters could be used along with sorting<br>
- A value of 1 or asc for the sort parameter will sort the results in ascending order<br>
- A value of -1 or desc for the sort parameter will sort the results in descending order<br><br>

```javascript
"http://localhost:3000/api/users?filter[first_name]=eq(John)&sort[age]=1";
```

- This will return all users with the first name John and sorted by age in ascending order<br><br>

```javascript
"http://localhost:3000/api/users?filter[first_name]=eq(John)&sort[age]=desc";
```

- This will return all users with the first name John and sorted by age in descending order<br><br>

## Selection Support<br><br>

```javascript
"http://localhost:3000/api/users?filter[first_name]=eq(John)&select=first_name,last_name";
```

- This will return all users with the first name John and only the first_name and last_name attributes will be returned<br><br>

```
"http://localhost:3000/api/users?filter[first_name]=eq(John)&select=-first_name,-last_name";
```

- This will return all users with the first name John and all attributes except the first_name and last_name attributes will be returned<br><br>

## Population Support<br><br>

```javascript
"http://localhost:3000/api/users?filter[first_name]=eq(John)&include=posts";
```

- This will return all users with the first name John and the posts attribute will be populated<br><br>

```javascript
"http://localhost:3000/api/users?filter[first_name]=eq(John)&include=posts,comments";
```

- This will return all users with the first name John and the posts and comments attributes will be populated<br><br>

```javascript

```
