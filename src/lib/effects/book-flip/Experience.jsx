'use client'
import { Environment, OrbitControls } from"@react-three/drei";
import { Book } from"./Book";

export const Experience = ({
 images = [],
 pathPattern ="/assets/nature",
 orbitControls = {},
 ...props
}) => {
 return (
 <>
 <OrbitControls
 enableDamping
 enablePan={false}
 enableZoom={false}
 target={[0, 0, 0]}
 {...orbitControls}
 />
 <Book images={images} pathPattern={pathPattern} {...props} />
 <Environment files="https://pub-830233752de349e29c6104a501b309d4.r2.dev/effects/book-flip/studio.hdr" />
 <directionalLight
 position={[2, 5, 2]}
 intensity={2.5}
 />
 </>
 );
};
