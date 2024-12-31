<template>
    <div class="min-h-screen flex flex-col justify-center items-center">
        <div class="shadow-md border pt-5 rounded-md">
            <div class="flex justify-center">
                <slot name="logo"/>
            </div>

            <div class="w-full sm:max-w-md px-6 py-4 overflow-hidden sm:rounded-lg">
                <slot/>
            </div>
        </div>
    </div>
</template>
