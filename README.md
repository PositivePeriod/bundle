# bundle
Turn-based strategy game

## Heroku DB
https://ellapresso.tistory.com/40
https://pinokio0702.tistory.com/122

### MySQL
heroku addons:create cleardb:ignite -a bundle-game  
heroku config -a bundle-game  
https://tableplus.com/

### Postgresql
https://m.blog.naver.com/batgirl1/222126972818

https://www.enterprisedb.com/postgresql-tutorial-resources-training?cid=924
https://www.postgresql.org/ftp/pgadmin/pgadmin4/v6.0/windows/

https://devcenter.heroku.com/articles/heroku-postgresql
https://devcenter.heroku.com/articles/postgres-logs-errors
https://tableplus.com/blog/2018/04/getting-started-with-tableplus.html

### TODO
Improve design; especially mobile
Give up button - surrender
Add more piece + map / map editor
Add timer - game death
Add leaderboard, ranking, tier
stable connection between server
server error handling
Game replay - stringify; decode; encode

Add notice board; for alert contest + community
Design, logo, icon, badge, tier, 
Gtag - google analytics

삼각형이나 육각형 tile에서 싸우면 어떻게 될까
이거 기반으로 세 명이서 싸우고 순서가 계속 바뀔 수 있다면?
대신 두 명만 계속 하는 것을 막기 위해서
2턴하고 안 한 사람 자동으로 정하기
ex. a b c b c a c a b
        |     |     |
        auto  auto  auto