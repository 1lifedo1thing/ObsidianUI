'use client'

import { r2 } from "@/lib/r2";
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
 <Environment files={r2("/effects/book-flip/studio.hdr")} />
 <directionalLight
 position={[2, 5, 2]}
 intensity={2.5}
 />
 </>
 );
};
