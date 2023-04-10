import { memo, useState, useEffect, useRef } from 'react';
//import mermaid from 'mermaid';
import { v4 as uuidv4 } from 'uuid';
// import DOMPurify from 'dompurify';

/*mermaid.initialize({
  startOnLoad: true,
  securityLevel: "loose",
  theme: "forest",
  logLevel: 5
});*/

export type MermaidDiagramProps = Readonly<{
  chart: string;
}>;

export function MermaidDiagram ({chart}: MermaidDiagramProps) {
  const componentRef = useRef<HTMLDivElement | null>(null);
  const componentUUID = useRef<string>(uuidv4());

  const [chartRender, setChartRender] = useState<string>('');
  const [chartError, setChartError] = useState<string>('');

  // useEffect(() => {
  //   mermaid.contentLoaded();
  // }, []);

  const displayError = (error: any) => {
    setChartRender('');
    setChartError(error?.message ?? 'Invalid Mermaid Syntax');
  };

  const displayChart = (render: string) => {
    if (render) {
      setChartRender(render);
    } else {
      setChartRender('');
    }
    setChartError('');
  };

  useEffect(() => {

    const renderChart = async (chartToRender: string) => {

      if (componentRef.current && chartToRender !== "") {
        try {
          //await mermaid.parse(chartToRender);
          const svg  = null
          //const { svg } = await mermaid.render(`mermaid-diagram-${componentUUID.current}`, chartToRender);
          if (svg) {
            displayChart(svg);
          } else {
            setChartRender('');;
          }
          setChartError('');
        } catch (err) {
          displayError(err);
        }
      }
    };

    renderChart(chart);
    }, [chart]);

  return (
    null
  );

}

export default memo(MermaidDiagram);
