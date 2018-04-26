# ng-welcome

Angular Onboarding Library

## This is a Work In Progress!

see [Demo](http://hillmann.cc/ng-welcome/)

### 1) Import the module in your module:
```typescript
@NgModule({
  imports: [ NgWelcomeModule ]
})
export AppModule {
}
```
### 2) Import the onboarding service in your component:
```typescript
constructor(private onboarding: Onboarding) {}
```
### 3) Define a template for the onboarding step:
```html
<img src="..." #someElementRef />
<ng-template #templateRef let-onboardingRef="onboardingRef">
  <h1>This is a onboarding overlay</h1>
  <button (click)="onboardingRef.close()">Skip</button>
  <button (click)="onboardingRef.next(true)">Back</button>
  <button (click)="onboardingRef.next()">Next</button>
</ng-template>
```
### 4) Start onboarding:
```typescript
 const config = {
  steps: [
    {
      template: this.templateRef,
      attachTo: this.someElementRef,
      position: 'right',
      offsetX: 20
    }
  ]
 };
 const onboardingRef = this.onboarding(config);
 ```
 ### Listen to events:
 ```typescript
 onboardingRef.afterClosed$().subscribe(() => {
  // do something on close
 });
