import { test, expect } from '@playwright/test';
test('study plan retains machines and walkthroughs on desktop and mobile',async({page})=>{
 await page.goto('/study-plan');
 await expect(page.getByRole('heading',{name:'Study plan',exact:true})).toBeVisible();
 await expect(page.getByText('Markup',{exact:true}).first()).toBeVisible();
 await page.getByRole('button',{name:'Walkthrough for Markup'}).first().click();
 await expect(page.getByRole('dialog')).toContainText('Official');
 await page.getByRole('button',{name:'Close walkthrough'}).click();
 await page.setViewportSize({width:390,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('cheat sheet search filters and code is copyable',async({page,context})=>{
 await context.grantPermissions(['clipboard-read','clipboard-write']);
 await page.goto('/cheat-sheet');
 await page.getByRole('searchbox').fill('nmap');
 await expect(page.locator('details').first()).toBeVisible();
 await page.getByRole('button',{name:'Copy code'}).first().click();
 expect(await page.evaluate(()=>navigator.clipboard.readText())).not.toBe('');
});
