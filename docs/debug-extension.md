# Debug extension

## Test the extension in isolation

- Disable all extensions
![Disable all extensions](https://user-images.githubusercontent.com/11786283/188285728-bc301bd4-89de-476e-aca0-9cbbeb5010e7.png)

- Enable just this extension: `phoenisx.cssvar`
<img width="686" alt="image" src="https://user-images.githubusercontent.com/11786283/188295886-5d6e29bf-8faf-497e-ad0b-3fc978e2ae86.png">

- Test if the extension works properly after this, if not please follow the steps from next section
- *You should enable all your installed extensions, once done testing the extension*
![Enable all extensions](https://user-images.githubusercontent.com/11786283/188285738-cc3dead9-2465-4690-8db1-c0c47bb2ab98.png)


## How to look into Console Errors/Warnings for this extension

### Step 1:

Open your deveoper tools form VSCode `Help` menu:

<img
  width="379"
  alt="toggle_dev_tools"
  src="https://user-images.githubusercontent.com/11786283/179458644-73f5a0f3-041a-4219-a40b-6cf0d8f3d48d.png"
/>

### Step 2:

Find the error/warning in the VSCode devtools view.
The error will have the following structure:

```yml
[cssvar]: ERROR MESSAGE
```

> Add the filter `[cssvar]:` in the DevTools Console, for better visibility.

Please share the entire error message when opening any issue. :bow:
