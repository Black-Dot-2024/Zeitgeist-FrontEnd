import { ReactNode } from 'react';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';

interface CardContainerProps {
    children: ReactNode;
}

export default function CardContainer({ children }: CardContainerProps) {
    return (
        <Card
            size="lg"
            variant="soft"
            sx={
                { 
                    bgcolor: '#EFEFEF', 
                    maxWidth: "100%", 
                }}
        >
            <CardContent>
                {children}
            </CardContent>
        </Card>
    );
}
