document.addEventListener('DOMContentLoaded', () => {

    const fileInput = document.getElementById('fileInput');

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) {
            return
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {defval: null});
            console.log(jsonData);
            // 过滤和转换数据
            const filteredData = jsonData
                .filter(item => item['订单状态'] !== '交易关闭')
                .map(item => ({
                    商品标题: item['商品标题'],
                    订单状态: item['订单状态'],
                    买家实付金额: parseFloat(item['买家实付金额']),
                    订单付款时间: item['订单付款时间']
                }));

            processRawData(filteredData);
        };
        reader.readAsArrayBuffer(file);
    });

    function processRawData(rawData) {
        const processedData = rawData
            .map(item => {
                const datePart = item.订单付款时间.split(' ')[0];
                const [year, month, day] = datePart.split('-');
                return {year, month, day, amount: item.买家实付金额.toFixed(2)};
            })
            .reduce((acc, {year, month, day, amount}) => {
                if (!acc[year]) acc[year] = {total: 0, months: {}};
                acc[year].total += parseFloat(amount);

                if (!acc[year].months[month]) acc[year].months[month] = {total: 0, days: {}};
                acc[year].months[month].total += parseFloat(amount);

                if (!acc[year].months[month].days[day]) acc[year].months[month].days[day] = 0;
                acc[year].months[month].days[day] += parseFloat(amount);
                return acc;
            }, {});
        const container = document.getElementById('chartsContainer');
        container.innerHTML = ''; // 清空之前的内容
        Object.entries(processedData).forEach(([year, yearData]) => {
            const yearDetails = document.createElement('details');
            const yearSummary = document.createElement('summary');
            yearSummary.innerHTML = `${year} 年总利润为: ${yearData.total.toFixed(2)} 元`;
            yearDetails.appendChild(yearSummary);
            container.appendChild(yearDetails);

            const sortedMonths = Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0'));
            const monthChartDiv = document.createElement('div');
            monthChartDiv.style.width = '1300px';
            monthChartDiv.style.height = '600px';
            yearDetails.appendChild(monthChartDiv);

            const monthChart = echarts.init(monthChartDiv);
            monthChart.setOption({
                title: {
                    text: `${year} 年每月利润`,
                    left: 'center'
                },
                xAxis: {
                    type: 'category',
                    data: sortedMonths.map(m => `${m}`),
                    name: '月份',
                    axisLabel: {interval: 0}
                },
                yAxis: {name: '利润总计'},
                series: [{
                    type: 'bar',
                    data: sortedMonths.map(m => yearData.months[m] ? yearData.months[m].total.toFixed(2) : '0.00'),
                    label: {show: true, position: 'top', formatter: '{c}'},
                    itemStyle: {color: '#3398DB'}
                }]
            });

            sortedMonths.forEach(month => {
                const monthDetails = document.createElement('details');
                const monthSummary = document.createElement('summary');
                const monthTotal = yearData.months[month] ? yearData.months[month].total.toFixed(2) : '0.00';
                monthSummary.innerHTML = `${year} 年 ${month} 月总利润为: ${monthTotal} 元`;
                monthDetails.appendChild(monthSummary);
                yearDetails.appendChild(monthDetails);

                const daysInMonth = new Date(year, month, 0).getDate();
                const days = Array.from({length: daysInMonth}, (_, i) => (i + 1).toString().padStart(2, '0'));
                const dayChartDiv = document.createElement('div');
                dayChartDiv.style.width = '1300px';
                dayChartDiv.style.height = '600px';
                monthDetails.appendChild(dayChartDiv);

                const dayChart = echarts.init(dayChartDiv);
                dayChart.setOption({
                    title: {
                        text: `${year} 年 ${month} 月每日利润`,
                        left: 'center'
                    },
                    xAxis: {
                        type: 'category',
                        data: days.map(d => `${d}`),
                        name: '日期',
                        axisLabel: {interval: 0}
                    },
                    yAxis: {name: '利润总计'},
                    series: [{
                        type: 'bar',
                        data: days.map(d => yearData.months[month] && yearData.months[month].days[d] ? yearData.months[month].days[d].toFixed(2) : '0.00'),
                        label: {show: true, position: 'top', formatter: '{c}'},
                        itemStyle: {color: '#3398DB'}
                    }]
                });
            });
        });
        document.getElementById('expandAll').addEventListener('click', () => {
            document.querySelectorAll('details').forEach(detail => {
                detail.open = true;
            });
        });
        document.getElementById('collapseAll').addEventListener('click', () => {
            document.querySelectorAll('details').forEach(detail => {
                detail.open = false;
            });
        });
    }
});
