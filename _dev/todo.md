### Must do before release

- Finish the user deletion cleanup
- Make friend request sends refresh status (see SearchScreen)
- Finish friend request and friend test suite
- Write a script for automatic maintenance handling (start, stop)

### Migrating to 0.3.0 database

- Transform all users/uid/beta_key_id from string -> number
- Add all nicknames for all users (from scratch)
- Add a maintenance node