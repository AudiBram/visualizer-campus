<h1>Campus Pathfinding Visualizer</h1>

## [Try it out!](https://visualizer-campus.vercel.app)

## About The Project
People's dependence on Google Maps and mobile phone apps is often used to show the location of an object or determine the route to a place with high accuracy. For example, to go to the city, most people prefer to rely on Google Maps rather than road signs. Displaying the user's real-time location, choosing the exact route to a place, providing warnings such as flooded roads are the advantages that make Google Maps attractive and in demand. The route finding application is very useful whether it is used outdoors or inside a building.

Many of us find that the use of Google Maps is generally limited to outdoor use, ideally to find objects or show routes to them. Whereas the need for this type of application is equally important for use inside buildings, especially in those with high complexity such as university buildings.

Through analyzing and making this application regarding the use of the dijsktra algorithm to find the shortest route, it is hoped that it can determine whether or not the use of this algorithm is appropriate to show the shortest route for indoor use, especially in the university environment.

## Data Preparation
I made personal observations by collecting data and finding the longitude and altitude to be the node point and connecting to the neighboring node point and also putting pictures so that visitors can easily find the room or building they want to go.

```json
{
  "node_id": 1,
  "node_name": "Gedung C.C",
  "description": "Gedung C.C",
  "latitude": -8.173899,
  "longitude": 113.716952,
  "photo": "img/example_img.jpg",
  "neighbors": [
    {
      "node_id": 2,
      "distance": 52
    }
  ]
}
```

## Pathfinding
Currently, this pathfinding only support Dijkstra. But, in the future I will update some Shortest Path algorithm.
- **Dijkstra**: Optimized breadth-first search that prioritizes exploring lower-cost paths.
    - *(weighted, shortest path guaranteed)*
- **A Star**: Optimized Dijkstra for when we know end node location. Uses lat/long distance as heuristic. **upcoming**
    - *(weighted, shortest path guaranteed)* 
- **Greedy Best-First Search**: Faster version of A* that doesn't guarantee shortest path. **upcoming**
    - *(weighted, shortest path not guaranteed)*
- **Breadth First Search**: Explores all nodes equally in all directions, level-by-level. **upcoming**
    - unweighted, shortest path guaranteed
- **Depth First Search**: Explores as far as possible along each branch before backtracing. **upcoming**
    - unweighted, shortest path not guaranteed

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes
4. Push to the Branch
5. Open a Pull Request

## License
Distributed under the MIT License. See `LICENSE.txt` for more information.