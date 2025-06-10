import * as d3 from 'd3';

export default class ElectionChart {
  constructor(app, containerSelector) {
    this.app = app; // Reference to the main App instance
    this.container = d3.select(containerSelector);
    this.initialData = null; // Store the original unfiltered data
    this.currentData = null; // Data to be used for drawing, potentially filtered
    // console.log('ElectionChart instantiated. Container:', this.container);
  }

  setData(data) {
    this.initialData = data; // Store the original unfiltered data
    this.currentData = data;  // Initially, current data is all data
    // console.log('ElectionChart data set. Initial rows:', this.initialData ? this.initialData.length : 0);
  }

  filterAndRedraw(filterCriteria) {
    // console.log('ElectionChart filterAndRedraw called with:', filterCriteria);
    let filteredData = this.initialData;

    if (filterCriteria && filterCriteria.ccaa && filterCriteria.ccaa !== 'all') {
      filteredData = this.initialData.filter(d => d.ccaa === filterCriteria.ccaa);
    }

    // console.log('Filtered data:', filteredData ? filteredData.length : 0, 'rows');
    this.currentData = filteredData; // Store currentData for drawing
    this.drawChart(); // Call the existing drawChart method, which should now use this.currentData
  }

  drawChart() {
    // console.log('ElectionChart drawChart using currentData with', this.currentData ? this.currentData.length : 0, 'rows');
    if (!this.currentData || this.currentData.length === 0) {
      // console.log('No data to draw chart.');
      this.container.selectAll('*').remove(); // Clear previous chart if no data
      this.container.append('p').text('No data to display for the selected filter.'); // Optional: display a message
      return;
    }

    // Clear previous chart
    this.container.selectAll('*').remove();

    // 1. Data Check: Done by the initial if statement.

    // 2. SVG Setup
    const margin = { top: 20, right: 30, bottom: 120, left: 100 }; // Increased bottom margin for rotated labels
    const width = 800;
    const height = 500;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = this.container.append('svg')
      .attr('width', width)
      .attr('height', height);

    const chartArea = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 3. Data Aggregation
    const aggregatedData = Array.from(
      d3.group(this.currentData, d => d.ccaa), // Use this.currentData
      ([key, values]) => ({ ccaa: key, population: d3.sum(values, v => v.population) })
    );
    // console.log('Aggregated Data:', aggregatedData);

    // 4. Scales
    // X-scale
    const xScale = d3.scaleBand()
      .domain(aggregatedData.map(d => d.ccaa))
      .range([0, innerWidth])
      .padding(0.1);

    // Y-scale
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(aggregatedData, d => d.population)])
      .range([innerHeight, 0]); // Inverted for SVG y-axis

    // 5. Axes
    // X-axis
    chartArea.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-65)'); // Rotated labels

    // Y-axis
    chartArea.append('g')
      .call(d3.axisLeft(yScale));

    // Y-axis title
    chartArea.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left + 10) // Adjust position
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Population');

    // Add a title to the chart
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Population by Autonomous Community (CCAA)");

    // 6. Bars
    chartArea.selectAll('.bar')
      .data(aggregatedData)
      .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.ccaa))
        .attr('y', d => yScale(d.population))
        .attr('width', xScale.bandwidth())
        .attr('height', d => innerHeight - yScale(d.population))
        .attr('fill', 'steelblue')
        // 7. Basic Styling/Labels (Tooltip)
        .append('title')
          .text(d => `${d.ccaa}: ${d.population.toLocaleString()}`);

    // console.log('Bar chart drawn.');
  }
}
