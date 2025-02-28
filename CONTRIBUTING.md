# Contributing to Next.js Dashboard

We welcome contributions to the Next.js Dashboard project. Whether it's a bug report, new feature, correction, or additional documentation, we appreciate your help!

## Table of Contents

- Getting Started
- How to Contribute
- Pull Request Guidelines
- Scripts
- Code of Conduct

## Getting Started

1. **Fork the Repository**: Click the "Fork" button at the top of this repository to create a copy of the repository under your GitHub account.
2. **Clone the Repository**: Clone your forked repository to your local machine.
    ```bash
    git clone https://github.com/your-username/nextjs-dashboard.git
    cd nextjs-dashboard
    ```
3. **Install Dependencies**: Install the required dependencies using npm or yarn.
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```

## How to Contribute

1. **Report Bugs**: If you find a bug, please report it by opening an issue on GitHub with detailed information about the bug and how to reproduce it.
2. **Suggest Features**: If you have an idea for a new feature, please create an issue to discuss it before working on it.
3. **Submit Pull Requests**: If you have fixed a bug or implemented a feature, please submit a pull request for review. Make sure to follow the [Pull Request Guidelines](#pull-request-guidelines).

## Pull Request Guidelines

1. **Create a Branch**: Create a new branch for your work.
    ```bash
    git checkout -b feature/your-feature-name
    ```
2. **Make Your Changes**: Make your changes in the new branch.
3. **Write Tests**: If applicable, write tests for your changes to ensure code quality.
4. **Commit Your Changes**: Write clear and concise commit messages.
    ```bash
    git add .
    git commit -m "Add feature X"
    ```
5. **Push to GitHub**: Push your changes to your forked repository.
    ```bash
    git push origin feature/your-feature-name
    ```
6. **Open a Pull Request**: Go to the original repository and open a pull request. Provide a clear description of your changes and link to any related issues.

## Scripts

Here are the main scripts available in the project:

- **Development**: Start the development server with live reloading.
    ```bash
    npm run dev
    ```

- **Build**: Create an optimized production build.
    ```bash
    npm run build
    ```

- **Start**: Start the production server.
    ```bash
    npm run start
    ```

- **Lint**: Run the linter to check for code quality issues.
    ```bash
    npm run lint
    ```

- **Lint Fix**: Automatically fix linter issues.
    ```bash
    npm run lint:fix
    ```

- **Format**: Format the code using Prettier.
    ```bash
    npm run format
    ```

- **Build Icons**: Build the icon bundle.
    ```bash
    npm run build:icons
    ```

- **Database Migrations**: Manage database migrations.
    - Generate a new migration:
        ```bash
        npm run migration:generate migrations/create-xxx-table
        ```
    - Run migrations:
        ```bash
        npm run migrate
        ```
    - Revert the last migration:
        ```bash
        npm run migration:revert
        ```

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it to understand the expected behavior.
