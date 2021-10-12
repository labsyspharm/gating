// Via https://www.d3-graph-gallery.com/graph/heatmap_style.html
class Heatmap {
    constructor(id, dataLayer) {
        this.id = id;
        this.dataLayer = dataLayer;
    }

    init() {
        const self = this;
        return self.dataLayer.getHeatmapData()
            .then(data => {
                self.visData = []
                _.each(data, (els, i) => {
                    _.each(els, (el, j) => {
                        self.visData.push({
                            col: self.dataLayer.phenotypes[i],
                            row: self.dataLayer.phenotypes[j],
                            val: el
                        });
                    })
                })
                return self.draw();
            })

    }

    draw() {
        const self = this;
        // set the dimensions and margins of the graph
        const margin = {top: 100, right: 100, bottom: 160, left: 160},
            width = 600 - margin.left - margin.right,
            height = 600 - margin.top - margin.bottom;

        // create a tooltip
        const tooltip = d3.select(`#${self.id}`)
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("z-index", 1)
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "5px")

        // append the svg object to the body of the page
        const svg = d3.select(`#${self.id}`)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("id", "heatmap-svg")
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // Build X scales and axis:
        let x = d3.scaleBand()
            .range([0, width])
            .domain(self.dataLayer.phenotypes)
            .padding(0.05);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickSize(0))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("font-size", "0.6rem")
            .attr("transform", "rotate(-90)");

        // Build Y scales and axis:
        let y = d3.scaleBand()
            .range([0, height])
            .domain(self.dataLayer.phenotypes)
            .padding(0.05);
        svg.append("g")
            .style("font-size", "0.6rem")
            .call(d3.axisLeft(y).tickSize(0))
        //Remove Axis Lines


        // Build color scale
        let myColor = d3.scaleSequential()
            .interpolator(d3.interpolateRdBu)
            .domain([1, -1])


        // add the squares
        svg.selectAll()
            .data(self.visData)
            .enter()
            .append("rect")
            .attr("x", function (d) {
                return x(d.row)
            })
            .attr("y", function (d) {
                return y(d.col)
            })
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", function (d) {
                if (d.row === d.col) {
                    return 'white';
                } else {
                    return myColor(d.val)
                }
            })
            .style("stroke-width", 4)
            .style("stroke", "none")
            .style("opacity", 0.8)
            .on("mouseover", (e, d) => {
                d3.select(e.currentTarget)
                    .style("stroke", "1px")
                    .style("opacity", 1)
            })
            .on("mousemove", (e, d) => {
                tooltip
                    .html(`<span>${d.row} - ${d.col}</span>
                        <br>
                        <span>Spearman Correlation coefficient: <b>${_.round(d.val, 2)}</b></span>`)
                    .style("left", (d3.pointer(e)[0] + 20) + "px")
                    .style("top", (d3.pointer(e)[1]) + "px")
            })
            .on("mouseleave", (e, d) => {
                tooltip
                    .style("opacity", 1)
                d3.select(e.currentTarget)
                    .style("stroke", "none")
                    .style("opacity", 0.8)
            })

        // Add title to graph
        svg.append("text")
            .attr("x", 0)
            .attr("y", -50)
            .attr("text-anchor", "left")
            .style("font-size", "22px")
            .text("Cell-Cell Colocalization");

        // Add subtitle to graph
        svg.append("text")
            .attr("x", 0)
            .attr("y", -30)
            .attr("text-anchor", "left")
            .style("font-size", "14px")
            .style("fill", "grey")
            .style("max-width", 400)
            .text("Spearman rank correlation coefficient of each pair of cell-types");



        // let color_scale = d3.axisTop(myColor);
        self.color_scale = d3.scaleLinear()
            .domain([-1, 1]) // unit: km
            .range([50, -50])
        let color_axis = d3.axisRight(self.color_scale)
            .tickValues([-1, 0, 1])
        svg.append("g")
            .attr("transform", `translate(${width + 15},${height / 2})`)
            .call(color_axis)
        let colorLegend = svg.append("g")
            .attr("transform", `translate(${width + 5},${height / 2})`)
        colorLegend.selectAll('rect')
            .data(_.range(-50, 51))
            .enter()
            .append('rect')
            .attr('x', 0)
            .attr('y', d => d)
            .attr('width', 10)
            .attr('height', 1)
            .attr('fill', d => {
                let p = self.color_scale.invert(d)
                return myColor(p);
            })

        colorLegend.append('text')
            .attr('x', 0)
            .attr('y', 60)
            .attr('font-size', "0.8rem")
            .attr('dominant-baseline', 'middle')
            .text('Avoidance')

        colorLegend.append('text')
            .attr('x', 0)
            .attr('y', -60)
            .attr('font-size', "0.8rem")
            .attr('dominant-baseline', 'middle')
            .text('Interaction')


    }
}