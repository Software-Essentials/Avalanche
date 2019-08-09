Avalanche is here!
The NodeJS framework for creating APIs, Web platforms, App services, or fullstack solutions!
No more structuring your Node projects over and over again.

# Getting started

A step by step guide how to get a development environment up and running

## Prerequisites
 
Install [NodeJS](https://nodejs.org/en/) from their [website](https://nodejs.org/en/)


## Installation

**1. Initialize project.**
```
npm init
```

**2. Install Avalanche.**
```
npm install avalanche
```

**3. Link the Avalanche CLI.**
```
npm link
```

**4. Initialize Avalanche.**
```
avalanche init
```

**5. Run your local webserver.**
```
avalanche run
```

**6. Navigate to [localhost](http://localhost).**

Done! For more info, browse the Avalanche wiki on GitHub.


## Troubleshooting

### Port in use

The default port is 80. Often times that port is in use and that causes problems.
To resolve this issue you can do two things; you can shutdown the application that is currently using that port on your machines and then retry. Alternatively, you can change the port in the environment file. This file can be found in "*app/environments/*". By default this file is called "*development.environment.json*".


# Author

* **Lawrence Bensaid** - [SoftwareEssentials](https://bitbucket.org/Software-Essentials/)
