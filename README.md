# Cooper Hewitt Art by Color Slack Slash Command

The slash command let's you ping [Cooper Hewitt's collection](https://collection.cooperhewitt.org/) API for a piece of art based on mood.



## Getting Started
To get started you need to:
- Add a Slash Command configuration to your Slack integrations
- Copy the generated Command Token
- Add your [Cooper Hewitt API token](https://collection.cooperhewitt.org/api/) to the `.env` file

For more detailed setup instructions, see `setup.md`.

## Using it


```
$ /museum { Hi || Hello || Hey }! I'm feeling { mood }.
```

mood:
- happy
- bummed
- anxious
- electric
- eager
- stoked
- goofy
- giggly
- remote
- tired
- caffeinated
- focused
- relieved
- relaxed
- tense
- intrigued
- content
- satisfied
- melancholy
- hurt
- overwhelmed
- delighted

It will randomly select one of the first 50 (max) objects so you may see duplicates. And, unless you remix, you're stuck with my mood->color notions ¯\\_(ツ)_/¯. No matter how you go, can guarantee you'll see some new art and make your day better.