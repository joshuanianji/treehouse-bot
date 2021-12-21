// https://stackoverflow.com/q/54622621
// I would expect Vite to be able to pick up with Vue and typescript automatically
// but it doesn't??

declare module "*.vue" {
    import Vue from 'vue';
    export default Vue;
}