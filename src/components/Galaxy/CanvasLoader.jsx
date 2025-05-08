import { Html, useProgress } from "@react-three/drei";

const CanvasLoader = () => {
    const { progress } = useProgress()

    return (
        <Html as="div" center style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column'
            }}
        >
            <span className="canvas-loader" style={{
                width: '50px',
                height: '50px',
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #3498db',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }} />
            <p style={{
                fontSize: 14,
                color: '#F1F1F1',
                fontWeight: 800,
                marginTop: 40
            }}>
                {progress.toFixed(2)}%
            </p>
        </Html>
    )
} 

export default CanvasLoader;