import { Component, ViewEncapsulation } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { PhoenixService } from './services/phoenix-service'

import * as d3 from 'd3'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {

  nodes = [
    {"id": 1, "group": '#aec7e8'},
    {"id": 2, "group": '#aec7e8'},
    {"id": 3, "group": '#aec7e8'},
    {"id": 4, "group": '#aec7e8'},
    {"id": 5, "group": '#aec7e8'},
    {"id": 6, "group": '#aec7e8'},
    {"id": 7, "group": '#aec7e8'},
    {"id": 8, "group": '#aec7e8'},
    {"id": 9, "group": '#aec7e8'},
    {"id": 10, "group": '#aec7e8'},
    {"id": 11, "group": '#aec7e8'},
    {"id": 12, "group": '#aec7e8'},
    {"id": 13, "group": '#aec7e8'},
    {"id": 14, "group": '#aec7e8'},
  ];
  
  links = [
    {"source": 1, "target": 2, "value": 1},
    {"source": 1, "target": 3, "value": 1},
    {"source": 1, "target": 4, "value": 1},
    {"source": 1, "target": 5, "value": 1},
    {"source": 2, "target": 6, "value": 1},
    {"source": 2, "target": 7, "value": 1},
    {"source": 2, "target": 8, "value": 1},
    {"source": 3, "target": 9, "value": 1},
    {"source": 4, "target": 10, "value": 1},
    {"source": 5, "target": 12, "value": 1},
    {"source": 10, "target": 11, "value": 1},
    {"source": 11, "target": 13, "value": 1},
    {"source": 11, "target": 14, "value": 1}

  ];

  tree = {
    "name":"Elixir.PATH",
    "children":[
      {
        "name":"Elixir.TEST","children":
        [
          {"name":"Elixir.LAB","children":[{"name":2,"children":[]},{"name":"Elixir.EQUAL","children":[]}]},
          {"name":"Elixir.CHILD","children":[]}]
      },
      {"name":"Elixir.SELF","children":[]}
    ]
  }

  private XPATH_ID = "xpath-id"
  private GRAPH_ID = "graph-id"

  public selectedId = 1

  private screenWidth
  private screenHeight
  private width
  private height

  constructor(private service: PhoenixService) { 
    this.screenWidth = window.screen.width
    this.screenHeight = window.screen.height
    this.width = this.screenWidth / 2.15
    this.height = this.screenHeight / 1.5
  }

  onKey(value: string) {
    this.compile(value)
  }

  private draw(nodes, links) {
    var self = this

    d3.select("#" + this.GRAPH_ID).remove()

    var svg = d3.select("#graph-cell")
      .append("svg")
      .attr("width", this.width).attr("height", this.height)
      .attr("id", this.GRAPH_ID)

    //var color = d3.scaleOrdinal(d3.schemeCategory20);

    var simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function(d) { return d.id; }))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(this.width / 2, this.height / 2));


    simulation
      .nodes(nodes)
      .on("tick", ticked);

    simulation.force("link")
      .links(links);

    var g = svg.append("g")
      .attr("class", "everything")

    var node = g.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
        .attr("r", function(d) { return 10 })
        .attr("id", function(d) { return "circle" + d.id })
        .attr("fill", function(d) { return d.group })
        .on("click", select)
        .call(d3.drag()
            .on("start", drag_start)
            .on("drag", drag_drag)
            .on("end", drag_end));

    var sNode = g.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes.filter(function(d) { return d.id == self.selectedId }))
      .enter()
      .append("circle")
        .attr("r", 15)
        .attr("id", function(d) { return "selected-id" })
        .attr("fill", "rgba(20, 150, 200, 0.15)")
        .attr("stroke", "rgba(100, 140, 50, 0.80)");

    d3.select("#circle" + self.selectedId)
      .append("circle")
      .attr("id", "new")
      .attr("r", 20)
      .attr("cx", function(d) { return d.x })
      .attr("cy", function(d) { return d.y })
      .attr("fill", "black")
      .filter(function(d) { return d.id == self.selectedId})


    var link = g.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

    var label = g.selectAll(".mytext")
      .data(nodes)
      .enter()
      .append("text")
        .text(function (d) { return d.id; })
        .style("text-anchor", "middle")
        .style("fill", "#555")
        .style("font-family", "Arial")
        .style("font-size", 12);

    var dragHandler = d3.drag()
      .on("start", drag_start)
      .on("drag", drag_drag)
      .on("end", drag_end)

    dragHandler(node)

    var zoomHandler = d3.zoom()
      .on("zoom", zoom_actions)

    zoomHandler(svg)

    function ticked() {
      link
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });

      sNode
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
      
      label
          .attr("x", function(d){ return d.x; })
          .attr("y", function (d) {return d.y - 15;})
    }

    function drag_start(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function drag_drag(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function drag_end(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    function zoom_actions() {
      g.attr("transform", d3.event.transform)
    }

    function select() {
      let node = d3.select(this)
      let x = node.attr("cx")
      let y = node.attr("cy")
      let id = node.attr("id")

      self.selectedId = parseInt(id.replace("circle", ""))
      console.info(self.selectedId)

      d3.select("#selected-id").remove()

      g.append("circle")
        .attr("id", "selected-id")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 15)
        .attr("fill", "rgba(20, 150, 200, 0.15)")
        .attr("stroke", "rgba(100, 140, 50, 0.80)")
    }
  }

  private drawTree(tree) {
    d3.select("#" + this.XPATH_ID).remove()

    var margin = {top: 40, right: 90, bottom: 50, left: 90}

    var svg = d3.select("#xpath-cell")
      .append("svg")
      .attr("width", this.width).attr("height", this.height)
      .attr("id", this.XPATH_ID);
    
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var i = 0, duration = 750, root

    var treemap = d3.tree().size([this.width / 2, this.height / 2])

    var nodes = d3.hierarchy(tree)

    nodes = treemap(nodes)

    var link = g.selectAll(".link")
      .data(nodes.descendants().slice(1))
      .enter()
      .append("path")
        .attr("class", "link")
        .attr("d", function(d) {
          return "M" + d.x + "," + d.y 
          + "C" + d.x + "," + (d.y + d.parent.y) / 2
          + " " + d.parent.x + "," + (d.y + d.parent.y) / 2
          + " " + d.parent.x + "," + d.parent.y
        })

    var node = g.selectAll(".node")
      .data(nodes.descendants())
      .enter()
      .append("g")
        .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })

    node.append("circle").attr("r", 10);

    node.append("text")
        .attr("dy", ".35em")
        .attr("y", function(d) { return d.children ? -20 : 20 })
        .style("text-anchor", "middle")
        .text(function(d) { return Number.isInteger(d.data.name) ? d.data.name : d.data.name.replace("Elixir.", "") })

    var dragHandler = d3.drag()
        .on("start", drag_start)
        .on("drag", drag_drag)
        .on("end", drag_end)
  
    dragHandler(node)
  
    var zoomHandler = d3.zoom()
        .on("zoom", zoom_actions)
  
    zoomHandler(svg)

    function drag_start(d) {
      d.fx = d.x;
      d.fy = d.y;
    }

    function drag_drag(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function drag_end(d) {
      d.fx = null;
      d.fy = null;
    }

    function zoom_actions() {
      g.attr("transform", d3.event.transform)
    }
  }

  ngAfterViewInit() {
    this.drawTree(this.tree)
    this.showGraph()
  }

  private compile(expression: string) {
    console.info('APP-COMPONENT : loaded')

    let body = {expression: expression, start: this.selectedId, nodes: this.nodes, links: this.links }

    console.info(body)

    this.service.getGraph(body)
      .subscribe(response => {
        console.log(response)
        this.drawTree(response.xpath)
        this.draw(response.result.nodes, response.result.links)
      })
  }

  private showGraph() {
    console.info("showGraph()")

    this.draw(this.nodes, this.links)
  }
}

