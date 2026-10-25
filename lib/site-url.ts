export function siteUrl(base:string,current:string){
  const from=new URL(current),url=new URL(base,from);
  // EdgeOne mainland preview links expire. Keep their access parameter when
  // navigating or sharing during acceptance testing; never forward other queries.
  const token=from.searchParams.get('eo_token');
  if(token){
    url.searchParams.set('eo_token',token);
    const time=from.searchParams.get('eo_time');
    if(time)url.searchParams.set('eo_time',time);
  }
  return url;
}
