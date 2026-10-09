# CTF Play Box - Backend (Spring Boot)

Backend shell for the IE3132 CTF Play Box assignment: user auth (players + admin),
challenge listing, flag submission, scoreboard, and admin challenge management.

## 1. Prerequisites
- Java 17+
- Maven (or use your IDE's built-in Maven)
- MySQL running locally (or update the URL in `application.properties` to point elsewhere)

## 2. Configure the database
Edit `src/main/resources/application.properties` and set your real MySQL password:
```
spring.datasource.password=YOUR_MYSQL_PASSWORD_HERE
```
The database `ctf_playbox` is created automatically on first run
(`createDatabaseIfNotExist=true`), and tables are created automatically by Hibernate.

## 3. Run it
```bash
mvn spring-boot:run
```
On first startup, the log shows (the admin line only appears the first time):
```
INFO ... com.ctfplaybox.config.DataSeeder : Seeded default admin - username: admin / password: ChangeMe123!
INFO ... com.ctfplaybox.config.DataSeeder : Seeded/Updated 8 interconnected challenges across 8 domains (1500 pts total) for Operation Aegis Breach!
```
The API is now live at `http://localhost:8080`.

### Run the tests
```bash
mvn test
```
The suite runs against an in-memory H2 database (`src/test/resources/application.properties`),
so MySQL does not need to be running. It covers the scoring rules (hint penalties, 50% floor)
and the REST API end to end: auth, flag submission and rate limits, hints, reset, scoreboard,
admin endpoints, and CORS.

**Change the seeded admin password before anyone else can reach this instance** —
edit `DataSeeder.java` or add an endpoint to change it later.

## 4. Test with curl (or import into Postman)

Register a player:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"player1","password":"Password123!"}'
```

Log in (save cookies to reuse the session):
```bash
curl -c cookies.txt -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"player1","password":"Password123!"}'
```

Check who you're logged in as:
```bash
curl -b cookies.txt http://localhost:8080/api/auth/me
```

List challenges:
```bash
curl -b cookies.txt http://localhost:8080/api/challenges
```

Submit a flag (example submission format):
```bash
curl -b cookies.txt -X POST http://localhost:8080/api/challenges/2/submit \
  -H "Content-Type: application/json" \
  -d '{"flag":"CTF{example_flag_here}"}'
```

View the scoreboard:
```bash
curl -b cookies.txt http://localhost:8080/api/scoreboard
```

Log in as admin and manage challenges:
```bash
curl -c admin_cookies.txt -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"ChangeMe123!"}'

curl -b admin_cookies.txt http://localhost:8080/api/admin/challenges

curl -b admin_cookies.txt -X PUT http://localhost:8080/api/admin/challenges/1 \
  -H "Content-Type: application/json" \
  -d '{"stageOrder":1,"title":"Digital Footprint - Updated","domain":"OSINT","difficulty":"Easy","description":"...","hint":"...","points":100,"flag":"CTF{your_new_flag}"}'
```

## 5. API summary

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | /api/auth/register | Public | Register a new player |
| POST | /api/auth/login | Public | Log in, creates a session |
| POST | /api/auth/logout | Authenticated | Ends the session |
| GET | /api/auth/me | Authenticated | Current user info |
| GET | /api/challenges | Authenticated | List active challenges (no flags) |
| GET | /api/challenges/{id} | Authenticated | One challenge's detail |
| POST | /api/challenges/{id}/submit | Authenticated | Submit a flag attempt |
| GET | /api/scoreboard | Authenticated | Ranked player scores |
| GET/POST/PUT/DELETE | /api/admin/challenges/** | ADMIN only | Manage challenges |
| GET | /api/admin/submissions | ADMIN only | View all submission attempts |

## 6. Notes for your report
- Flags are never stored in plaintext — only a BCrypt hash (`Challenge.flagHash`), same
  approach as password storage, and the `@JsonIgnore` annotation stops it ever leaking
  through the API even to an admin's browser network tab.
- Sessions (not JWT) are used, matching what you specified — CORS is configured for
  `http://localhost:3000` (the default React dev server) with credentials enabled so the
  session cookie is sent on every request.
- The 6 seeded challenges are **placeholders** matching your assignment's domain list —
  replace the description/hint/flag values with your team's actual designed challenges
  before this becomes your real submission evidence.
- `spring.jpa.hibernate.ddl-auto=update` is fine for coursework but should be called out
  as a simplification in your report's "Risks/Limitations" section — a real deployment
  would use migrations (e.g. Flyway).

## Next step
Once this is confirmed working, the React frontend will call these endpoints for
login, the challenge list, flag submission, and the scoreboard.
