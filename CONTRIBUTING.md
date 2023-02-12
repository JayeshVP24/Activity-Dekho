# Contributing

When it comes to open source, there are different ways you can contribute, all
of which are valuable. Here's few guidelines that should help you as you prepare
your contribution.

## Initial steps

Before you start working on a contribution, create an issue describing what you want to build. It's possible someone else is already working on something similar, or perhaps there is a reason that feature isn't implemented. The maintainers will point you in the right direction.

<!-- ## Submitting a Pull Request

- Fork the repo
- Clone your forked repository: `git clone git@github.com:{your_username}/zod.git`
- Enter the zod directory: `cd zod`
- Create a new branch off the `master` branch: `git checkout -b your-feature-name`
- Implement your contributions (see the Development section for more information)
- Push your branch to the repo: `git push origin your-feature-name`
- Go to https://github.com/colinhacks/zod/compare and select the branch you just pushed in the "compare:" dropdown
- Submit the PR. The maintainers will follow up ASAP. -->

## Development

The following steps will get you setup to contribute changes to this repo:

1. Fork this repo.

2. Clone your forked repo: `git clone git@github.com:{your_username}/zod.git`

3. Run `yarn` to install dependencies.

4. Create your own Firebase Project, initalize a Web App, Firestore, Authentication and Cloud Storage in Firebsase

5. Copy `.env.example` and rename it to `.env.local`

6. Copy the Firebase Web App config to the new `.env.local` file to its respective fields
    ```
    NEXT_PUBLIC_FIREBASE_API_KEY = "firebae-api-key-here"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "project-id.firebaseapp.com"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID = "project-id"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "project-id.appspot.com"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = firebase-messaging-sender-id"
    NEXT_PUBLIC_FIREBASE_APP_ID = "firebase-app-id"
    ```
  
  7. To setup the backend read Admin-Activity-Dekho contributing.md
  
  8. Done.

## License

By contributing your code to the Activity-Dekho GitHub repository, you agree to
license your contribution under the MIT license.
