social connectedness platform leveraging semantic similarity algorithm to connect people with similar interests and activities.

## Prerequisites
-   Python 3.12+

## Installation

1.  Create a virtual environment:
    ```bash
    python -m venv .venv
    ```
2.  Activate the virtual environment:
    -   Windows: `.venv\Scripts\activate`
    -   Mac/Linux: `source .venv/bin/activate`
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    npm install
    ```

## Running the Server

Run the server with auto-reload:

```bash
uvicorn app.main:app --reload
```


run frontend:
```bash
npm run dev
```

## API Documentation

Once running, access the interactive API docs at:
-   Swagger UI: http://127.0.0.1:8000/docs



## Explanation
Communities, what exactly defines one? At first, you might think of something simple, like your hometown basketball team, as a community. While that is true, the idea of a community extends far beyond that. At its core, a community is simply a group of people, meaning even the smallest group can be considered one. Communities are a key factor in world socialization because they shape how people learn to interact with others and understand shared values, norms, and cultures.

When thinking about communities, it raises an important question: how easy is it to create or join one? On the surface, it may seem easy enough. But do others feel the same way? Especially those who are actively trying to become part of an existing community? There is a significant difference between simply joining a community and truly bonding with its members. This process can be especially difficult because many communities already have strong connections formed over time. Research suggests that people who join public communities often feel secluded or left out, even when they are technically included. This happens because the established relationships within the group still exist, creating an unspoken barrier for newcomers.

In response to these challenges, we created a website centered entirely on building and strengthening communities from the ground up. Unlike public communities where they already have established social circles and unspoken norms, our platform allows individuals to create their own communities from scratch, making the process more easier. By giving users the ability to get to know each other on the same pace the platform reduces the social barriers that often make newcomers feel excluded and improves team connection. Research shows that people are more likely to feel a sense of belonging when they actively participate in shaping the group, rather than entering a group that's already fully developed. Studies on online communities also suggest that digital platforms can lower social anxiety and increase participation, as they allow individuals to connect at their own pace and find others with similar interests more inclusive. By combining these findings with an accessible and ai that helps to match users, our website makes it easier for people not just to join a community, but to truly build and belong to one.