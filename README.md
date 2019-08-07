# Avalanche

Avalanche is here!
The NodeJS framework for creating APIs, Web platforms, App services, or fullstack solutions!
No more structuring your Node projects over and over again.

## **1:** Getting Started

These instructions will get you a copy of the project up and running on your local machine for development purposes.

### **1.1:** Prerequisites
 
Install [NodeJS](https://nodejs.org/en/) from their [website](https://nodejs.org/en/)

### **1.2:** Installing

A step by step guide how to get a development environment up and running

*Comming soon*

Initialize Avalanche.
```
avalanche init
```

Run your local webserver.
```
avalanche run
```

Navigate to [localhost](http://localhost).

Done!

## **2:** Definitions & Standards

These are basic standards used by the Avalanche team. They are used in the framework and we recommend you use them in your project.

### **2.1:** Coding standards

**Examples:**

Function conventions
```
function name() {

}
```

If-statement conventions
```
if(condition) {
    
} else if(condition) {

} else {

}
```

Use consts unless you are planning on changing your variable.
```
const variableName = "value";
```

**Best practices**

Wrong:
```
doSomethingWith(getValue("value"));
```

Good:
```
const value = getValue("value");

doSomethingWith(value);
```

**store, destroy, update, show VS create, delete, edit, view**

*Use store, destroy, update, show for the backend. For example in URLs*

*Use create, delete, edit, view for the frontend. For example as a text in buttons*


### **2.2:** Guidelines

* We use [SemVer](http://semver.org/) as versioning format
* Function names are writen [camel case](https://en.wikipedia.org/wiki/Camel_case)
* Variable names are writen [camel case](https://en.wikipedia.org/wiki/Camel_case)
* JSON object keys are writen [camel case](https://en.wikipedia.org/wiki/Camel_case)
* Class names are writen [pascal case](http://wiki.c2.com/?PascalCase)
* Table column names are writen [snake case](https://en.wikipedia.org/wiki/Snake_case)
* Table names are writen as [singular nouns](https://www.k12reader.com/term/singular-nouns/)
* Foreign keys in database tables are usualy an integer with a length of **10**
* We use the [smartcommit](https://confluence.atlassian.com/fisheye/using-smart-commits-960155400.html) format with the issuekey followed by the time followed by the comment

**Smart commit example:**

```
AVA-1 #time 1h #comment Initial commit
```

## **3:** Codebase structure

* **/app** - *All custom files are stored here*
* **/app/controllers** - *Controllers*
* **/app/environments** - *Environmental configuration*
* **/app/localisations** - *For your different Locale*
* **/app/public** - *Static folder. This is where you leave your assets since it will be directly accessible from your browser.*
* **/app/routes** - *routes defined in JSON files*
* **/app/templates** - *HBS templates*
* **/app/views** - *ViewControllers*
* **/core** - *Framework files are stored here, you don't have any business in here but feel free to look around*

## **4:** Authors

* **Lawrence Bensaid** - [SoftwareEssentials](https://bitbucket.org/Software-Essentials/)
