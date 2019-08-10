Avalanche is here!
The NodeJS framework for creating APIs, Web platforms, App services, or fullstack solutions!
No more structuring your Node projects over and over again.

# Getting started

A step by step guide how to get a development environment up and running

## Prerequisites
 
Install [NodeJS](https://nodejs.org/en/) from their [website](https://nodejs.org/en/)


## Installation

**1. Install Avalanche globally.**
This allows the CLI to work with a global perspective.
It also prevents issues while updating Avalanche in the future.

(*NOTE: You might need to use `sudo`*)
```
npm install avacore -g
```

**2. Link the Avalanche CLI.**
This allows the "*avalanche*" and "*ava*" command to be used.

(*NOTE: You might need to use `sudo`*)
```
npm link avacore
```

**3. Install Avalanche in your NPM project.**
This allows you to access the Avalanche Core Library
```
npm install avacore
```

**4. Initialize Avalanche.**
This sets up your Avalanche project.
```
avalanche init
```
or to load the example project.
```
avalanche init example1
```

**5. Run your local webserver.**
```
avalanche run
```

**6. Navigate to [localhost](http://localhost).**

Done! For more info, browse the [Avalanche wiki on GitHub](https://github.com/noriacorp/Avalanche/wiki).


## Troubleshooting

### Port in use

The default port is 80. Often times that port is in use and that causes problems.
To resolve this issue you can do two things; you can shutdown the application that is currently using that port on your machines and then retry. Alternatively, you can change the port in the environment file. This file can be found in "*app/environments/*". By default this file is called "*development.environment.json*".


# Author

* **Lawrence Bensaid** - [SoftwareEssentials](https://bitbucket.org/Software-Essentials/)
