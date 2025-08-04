import React, {useState, useEffect} from 'react';
import {Box, Text} from 'ink';

interface Props {
	text: string;
}

// Character shimmer component for generating states
export function ShimmerText({text}: Props) {
	const [shimmerIndex, setShimmerIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setShimmerIndex(prev => (prev + 1) % (text.length + 5));
		}, 100);
		return () => clearInterval(interval);
	}, [text.length]);

	return (
		<Box>
			{text.split('').map((char, index) => {
				const isShimmering = index >= shimmerIndex - 2 && index <= shimmerIndex + 2;
				const shimmerIntensity = 2 - Math.abs(index - shimmerIndex);
				
				let color: string = 'white';
				let useChar = char;
				
				if (isShimmering && char !== ' ') {
					if (shimmerIntensity === 2) {
						color = 'yellow';
						useChar = '▓';
					} else if (shimmerIntensity === 1) {
						color = 'cyan';
						useChar = '▒';
					} else {
						color = 'blue';
					}
				} else if (char !== ' ') {
					color = 'gray';
				}

				return (
					<Text key={index} color={color}>
						{useChar}
					</Text>
				);
			})}
		</Box>
	);
}