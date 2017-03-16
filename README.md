# Cooper Hewitt Art by Color Slack Slash Command

The slash command let's you ping Cooper Hewitt's collection API for a piece of art based on mood.



## Getting Started
To get started you need to:
- Add a Slash Command configuration to your Slack integrations
- Copy the generated Command Token
- Add your Cooper Hewitt API token ato the `.env` file

For more detailed setup instructions, see `setup.md`.

## Using it


```
$ /museum { Hi || Hello || Hey }! I'm feeling { mood }.
```

mood:
- happy
- bummed
- electric
- stoked
- goofy
- giggly
- remote
- tired
- caffeinated
- focused
- relaxed
- tense

It will randomly select one of the first 50 (max) objects so you may see duplicates. And, unless you remix, you're stuck with my mood->color notions ¯\\_(ツ)_/¯.