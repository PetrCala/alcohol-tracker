### Must do before release

- Finish the user deletion cleanup
- Finish friend request and friend test suite
- Finish user profile pictures handling
- Make sure the update screen is decently handled for both Android and iOS
- Handle the flashing when opening a user's profile (or app too)
- Fix the bug when opening a keyboard in search window (disappears)

### Migrating to 0.3.0 database

- Transform all users/uid/beta_key_id from string -> number
- Add all nicknames for all users (from scratch)
- Add a maintenance node
- Clean up the potential remaining bugs from the currentSession vs. ongoingSession inconsistencies
- Publish new rules