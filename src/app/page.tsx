'use client';

import React from 'react';
import PreferenceForm from '@/components/PreferenceForm';


export default function Home() {
    const region = process.env.NEXT_PUBLIC_AWS_REGION;

console.log('AWS Region:', region);
  return (
    <PreferenceForm></PreferenceForm>
  );
}
