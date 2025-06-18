import { NextRequest, NextResponse } from 'next/server';

const STB_SERVICES_API_BASE_URL = 'https://api.stb.gov.sg/services/navigation/v2/search';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dataset = searchParams.get('dataset');
  const latitude = searchParams.get('latitude') || '1.2835627'; // Default to Singapore center
  const longitude = searchParams.get('longitude') || '103.8584985';

  if (!dataset) {
    return NextResponse.json({ error: 'Dataset parameter is required' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_STB_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'STB API key not configured' }, { status: 500 });
  }

  try {
    const url = new URL(STB_SERVICES_API_BASE_URL);
    url.searchParams.append('location', `${latitude},${longitude}`);
    url.searchParams.append('radius', '2000'); // Always 2000 as requested
    url.searchParams.append('dataset', dataset);
    url.searchParams.append('limit', '2'); // Always 2 as requested

    const response = await fetch(url.toString(), {
      headers: {
        'ApiEndPointTitle': 'Search Map By Multiple Datasets',
        'Content-Type': 'application/json',
        'X-Content-Language': '',
        'X-API-Key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`STB API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error fetching from STB API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from STB API' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
